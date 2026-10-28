// HTTP client for the Go API: { data } / { error: { code, message } } envelope,
// Bearer injection, and a single shared refresh when a request gets a 401.

export interface Tokens {
    accessToken: string;
    refreshToken: string;
}

export interface TokenStore {
    get(): Promise<Tokens | null>;
    set(tokens: Tokens): Promise<void>;
    clear(): Promise<void>;
}

export class ApiError extends Error {
    constructor(
        readonly status: number,
        readonly code: string,
        message: string,
    ) {
        super(message);
        this.name = "ApiError";
    }
}

export interface RequestOptions {
    method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
    body?: unknown;
    /** Defaults to true: sends the access token and refreshes it on 401. */
    auth?: boolean;
}

export interface ApiClient {
    request<T>(path: string, options?: RequestOptions): Promise<T>;
}

export interface ApiClientConfig {
    baseUrl: string;
    timeoutMs: number;
    tokens: TokenStore;
    /** Called once the refresh token is rejected: the session is over. */
    onSessionExpired: () => void;
    fetch?: typeof fetch;
}

interface RefreshResponse {
    access_token: string;
    refresh_token: string;
}

function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === "object" && value !== null;
}

async function readJson(response: Response): Promise<unknown> {
    const text = await response.text();
    if (!text) return undefined;
    try {
        return JSON.parse(text);
    } catch {
        return undefined;
    }
}

function toApiError(status: number, body: unknown): ApiError {
    const error = isRecord(body) ? body.error : undefined;
    if (isRecord(error) && typeof error.message === "string") {
        const code = typeof error.code === "string" ? error.code : "http_error";
        return new ApiError(status, code, error.message);
    }
    return new ApiError(status, "http_error", `HTTP ${status}`);
}

export function createApiClient(config: ApiClientConfig): ApiClient {
    const doFetch = config.fetch ?? fetch;
    let refreshing: Promise<boolean> | null = null;

    async function send(
        path: string,
        method: string,
        body: unknown,
        accessToken: string | null,
    ): Promise<Response> {
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), config.timeoutMs);
        const headers: Record<string, string> = { Accept: "application/json" };
        if (body !== undefined) headers["Content-Type"] = "application/json";
        if (accessToken) headers.Authorization = `Bearer ${accessToken}`;
        try {
            return await doFetch(`${config.baseUrl}${path}`, {
                method,
                headers,
                body: body === undefined ? undefined : JSON.stringify(body),
                signal: controller.signal,
            });
        } catch (err) {
            if (controller.signal.aborted) {
                throw new ApiError(0, "timeout", "La requête a expiré");
            }
            throw new ApiError(
                0,
                "network_error",
                err instanceof Error ? err.message : "Erreur réseau",
            );
        } finally {
            clearTimeout(timer);
        }
    }

    async function refresh(): Promise<boolean> {
        const tokens = await config.tokens.get();
        if (!tokens) return false;
        try {
            const response = await send(
                "/auth/refresh",
                "POST",
                { refresh_token: tokens.refreshToken },
                null,
            );
            if (!response.ok) return false;
            const body = await readJson(response);
            const data = isRecord(body) ? body.data : undefined;
            if (
                !isRecord(data) ||
                typeof data.access_token !== "string" ||
                typeof data.refresh_token !== "string"
            ) {
                return false;
            }
            const next = data as unknown as RefreshResponse;
            await config.tokens.set({
                accessToken: next.access_token,
                refreshToken: next.refresh_token,
            });
            return true;
        } catch {
            // Network failure during refresh: keep the tokens, the caller gets the 401.
            return false;
        }
    }

    // Concurrent 401s share the same refresh call.
    function refreshOnce(): Promise<boolean> {
        refreshing ??= refresh().finally(() => {
            refreshing = null;
        });
        return refreshing;
    }

    async function request<T>(
        path: string,
        options: RequestOptions = {},
    ): Promise<T> {
        const { method = "GET", body, auth = true } = options;
        const token = auth
            ? ((await config.tokens.get())?.accessToken ?? null)
            : null;

        let response = await send(path, method, body, token);

        if (response.status === 401 && auth) {
            if (await refreshOnce()) {
                const retryToken = (await config.tokens.get())?.accessToken;
                response = await send(path, method, body, retryToken ?? null);
            }
            if (response.status === 401) {
                await config.tokens.clear();
                config.onSessionExpired();
            }
        }

        const json = await readJson(response);
        if (!response.ok) throw toApiError(response.status, json);
        return (isRecord(json) ? json.data : undefined) as T;
    }

    return { request };
}
