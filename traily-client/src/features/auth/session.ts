import { ApiError, type TokenStore } from "@/lib/api/client";
import { setAnonymous, setAuthenticated } from "@/store/session";

import type { AuthApi, AuthResult, LoginInput, RegisterInput } from "./types";

export interface SessionService {
    /** Restores the session from stored tokens; call once at startup. */
    hydrate(): Promise<void>;
    login(input: LoginInput): Promise<void>;
    register(input: RegisterInput): Promise<void>;
    logout(): Promise<void>;
}

export function createSessionService(
    api: AuthApi,
    tokens: TokenStore,
): SessionService {
    async function start(result: AuthResult) {
        await tokens.set({
            accessToken: result.accessToken,
            refreshToken: result.refreshToken,
        });
        setAuthenticated(result.user);
    }

    return {
        async hydrate() {
            try {
                if (!(await tokens.get())) return setAnonymous();
                setAuthenticated(await api.me());
            } catch (err) {
                // Offline at startup: tokens stay, the user retries later.
                if (err instanceof ApiError && err.status === 401) {
                    await tokens.clear();
                }
                setAnonymous();
            }
        },
        async login(input) {
            await start(await api.login(input));
        },
        async register(input) {
            await start(await api.register(input));
        },
        async logout() {
            await tokens.clear();
            setAnonymous();
        },
    };
}
