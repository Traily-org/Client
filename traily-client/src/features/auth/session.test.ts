import { beforeEach, describe, expect, it, vi } from "vitest";

import { ApiError, type Tokens, type TokenStore } from "@/lib/api/client";
import { useSessionStore } from "@/store/session";

import { mapAuthResponse } from "./api";
import { createSessionService } from "./session";
import type { AuthApi, User } from "./types";

const user: User = {
    id: "u1",
    email: "alice@example.com",
    username: "alice",
    displayName: null,
    avatarUrl: null,
};

function memoryTokens(initial: Tokens | null = null) {
    let value = initial;
    const store: TokenStore = {
        get: async () => value,
        set: async (t) => {
            value = t;
        },
        clear: async () => {
            value = null;
        },
    };
    return { store, current: () => value };
}

function fakeApi(overrides: Partial<AuthApi> = {}): AuthApi {
    return {
        login: async () => ({ user, accessToken: "a", refreshToken: "r" }),
        register: async () => ({ user, accessToken: "a", refreshToken: "r" }),
        me: async () => user,
        ...overrides,
    };
}

beforeEach(() => {
    useSessionStore.setState({ status: "loading", user: null });
});

describe("createSessionService", () => {
    it("hydrates as anonymous without stored tokens", async () => {
        await createSessionService(fakeApi(), memoryTokens().store).hydrate();
        expect(useSessionStore.getState().status).toBe("anonymous");
    });

    it("hydrates the user from stored tokens", async () => {
        const tokens = memoryTokens({ accessToken: "a", refreshToken: "r" });
        await createSessionService(fakeApi(), tokens.store).hydrate();
        expect(useSessionStore.getState()).toMatchObject({
            status: "authenticated",
            user,
        });
    });

    it("drops rejected tokens on hydrate", async () => {
        const tokens = memoryTokens({ accessToken: "a", refreshToken: "r" });
        const api = fakeApi({
            me: vi.fn(async () => {
                throw new ApiError(401, "unauthorized", "no");
            }),
        });
        await createSessionService(api, tokens.store).hydrate();
        expect(tokens.current()).toBeNull();
        expect(useSessionStore.getState().status).toBe("anonymous");
    });

    it("keeps tokens when offline at startup", async () => {
        const tokens = memoryTokens({ accessToken: "a", refreshToken: "r" });
        const api = fakeApi({
            me: async () => {
                throw new ApiError(0, "network_error", "offline");
            },
        });
        await createSessionService(api, tokens.store).hydrate();
        expect(tokens.current()).not.toBeNull();
    });

    it("stores tokens on login and clears them on logout", async () => {
        const tokens = memoryTokens();
        const service = createSessionService(fakeApi(), tokens.store);

        await service.login({
            email: "alice@example.com",
            password: "secret12",
        });
        expect(tokens.current()).toEqual({
            accessToken: "a",
            refreshToken: "r",
        });
        expect(useSessionStore.getState().status).toBe("authenticated");

        await service.logout();
        expect(tokens.current()).toBeNull();
        expect(useSessionStore.getState()).toMatchObject({
            status: "anonymous",
            user: null,
        });
    });
});

describe("mapAuthResponse", () => {
    it("falls back to the sign-up name when display_name is unset", () => {
        expect(
            mapAuthResponse({
                access_token: "a",
                refresh_token: "r",
                user: {
                    id: "u1",
                    email: "e@x.io",
                    name: "Eve",
                    display_name: null,
                },
            }).user.displayName,
        ).toBe("Eve");
    });

    it("maps snake_case DTOs and nullable fields", () => {
        expect(
            mapAuthResponse({
                access_token: "a",
                refresh_token: "r",
                user: { id: "u1", email: "e@x.io", display_name: "Eve" },
            }),
        ).toEqual({
            accessToken: "a",
            refreshToken: "r",
            user: {
                id: "u1",
                email: "e@x.io",
                username: null,
                displayName: "Eve",
                avatarUrl: null,
            },
        });
    });
});
