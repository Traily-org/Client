import { describe, expect, it, vi } from "vitest";

import {
    ApiError,
    createApiClient,
    type Tokens,
    type TokenStore,
} from "./client";

function memoryTokens(initial: Tokens | null = null): TokenStore & {
    value: Tokens | null;
} {
    return {
        value: initial,
        async get() {
            return this.value;
        },
        async set(tokens) {
            this.value = tokens;
        },
        async clear() {
            this.value = null;
        },
    };
}

function json(status: number, body?: unknown): Response {
    return new Response(body === undefined ? null : JSON.stringify(body), {
        status,
    });
}

function setup(tokens = memoryTokens(), handler?: typeof fetch) {
    const fetchMock = vi.fn(handler ?? (async () => json(200, { data: 1 })));
    const onSessionExpired = vi.fn();
    const client = createApiClient({
        baseUrl: "https://api.test/api/v1",
        timeoutMs: 50,
        tokens,
        onSessionExpired,
        fetch: fetchMock as typeof fetch,
    });
    return { client, fetchMock, onSessionExpired, tokens };
}

function authHeader(init: RequestInit | undefined): string | undefined {
    return (init?.headers as Record<string, string>).Authorization;
}

describe("createApiClient", () => {
    it("unwraps the data envelope", async () => {
        const { client } = setup(memoryTokens(), async () =>
            json(200, { data: { id: "42" } }),
        );
        await expect(client.request("/x")).resolves.toEqual({ id: "42" });
    });

    it("returns undefined on 204", async () => {
        const { client } = setup(memoryTokens(), async () => json(204));
        await expect(client.request("/x")).resolves.toBeUndefined();
    });

    it("decodes the error envelope into an ApiError", async () => {
        const { client } = setup(memoryTokens(), async () =>
            json(409, { error: { code: "email_taken", message: "Déjà pris" } }),
        );
        await expect(client.request("/x")).rejects.toMatchObject({
            status: 409,
            code: "email_taken",
            message: "Déjà pris",
        });
    });

    it("falls back to a generic error when the body is not an envelope", async () => {
        const { client } = setup(memoryTokens(), async () =>
            json(500, { error: "boom" }),
        );
        await expect(client.request("/x")).rejects.toMatchObject({
            status: 500,
            code: "http_error",
        });
    });

    it("sends the Bearer token and JSON body", async () => {
        const { client, fetchMock } = setup(
            memoryTokens({ accessToken: "a1", refreshToken: "r1" }),
        );
        await client.request("/x", { method: "POST", body: { a: 1 } });
        const [url, init] = fetchMock.mock.calls[0];
        expect(url).toBe("https://api.test/api/v1/x");
        expect(authHeader(init)).toBe("Bearer a1");
        expect(init?.body).toBe('{"a":1}');
    });

    it("does not send the token when auth is false", async () => {
        const { client, fetchMock } = setup(
            memoryTokens({ accessToken: "a1", refreshToken: "r1" }),
        );
        await client.request("/auth/login", { auth: false });
        expect(authHeader(fetchMock.mock.calls[0][1])).toBeUndefined();
    });

    it("refreshes on 401 and retries with the new token", async () => {
        const { client, tokens } = setup(
            memoryTokens({ accessToken: "old", refreshToken: "r1" }),
            async (url, init) => {
                if (String(url).endsWith("/auth/refresh")) {
                    return json(200, {
                        data: { access_token: "new", refresh_token: "r2" },
                    });
                }
                return authHeader(init) === "Bearer new"
                    ? json(200, { data: "ok" })
                    : json(401);
            },
        );
        await expect(client.request("/x")).resolves.toBe("ok");
        expect(tokens.value).toEqual({
            accessToken: "new",
            refreshToken: "r2",
        });
    });

    it("shares a single refresh between concurrent 401s", async () => {
        let refreshCalls = 0;
        const { client } = setup(
            memoryTokens({ accessToken: "old", refreshToken: "r1" }),
            async (url, init) => {
                if (String(url).endsWith("/auth/refresh")) {
                    refreshCalls++;
                    await new Promise((r) => setTimeout(r, 5));
                    return json(200, {
                        data: { access_token: "new", refresh_token: "r2" },
                    });
                }
                return authHeader(init) === "Bearer new"
                    ? json(200, { data: "ok" })
                    : json(401);
            },
        );
        await Promise.all([client.request("/a"), client.request("/b")]);
        expect(refreshCalls).toBe(1);
    });

    it("clears tokens and ends the session when refresh fails", async () => {
        const { client, tokens, onSessionExpired } = setup(
            memoryTokens({ accessToken: "old", refreshToken: "r1" }),
            async () => json(401),
        );
        await expect(client.request("/x")).rejects.toMatchObject({
            status: 401,
        });
        expect(tokens.value).toBeNull();
        expect(onSessionExpired).toHaveBeenCalledOnce();
    });

    it("maps network failures to network_error", async () => {
        const { client } = setup(memoryTokens(), async () => {
            throw new TypeError("Network request failed");
        });
        await expect(client.request("/x")).rejects.toMatchObject({
            status: 0,
            code: "network_error",
        });
    });

    it("aborts after the timeout", async () => {
        const { client } = setup(
            memoryTokens(),
            (_url, init) =>
                new Promise((_resolve, reject) => {
                    init?.signal?.addEventListener("abort", () =>
                        reject(new Error("aborted")),
                    );
                }),
        );
        const error = await client.request("/x").catch((e: unknown) => e);
        expect(error).toBeInstanceOf(ApiError);
        expect(error).toMatchObject({ code: "timeout" });
    });
});
