import { ApiError } from "@/lib/api/client";

import type { AuthApi, User } from "./types";

// shortcut: in-memory fake until the backend ships /auth/*; remove once it does.
export function createMockAuthApi(): AuthApi {
    let current: User | null = null;

    function signIn(email: string, name?: string) {
        current = {
            id: "00000000-0000-4000-8000-000000000001",
            email,
            username: email.split("@")[0],
            displayName: name ?? null,
            avatarUrl: null,
        };
        return {
            user: current,
            accessToken: "mock-access",
            refreshToken: "mock-refresh",
        };
    }

    return {
        async login({ email, password }) {
            if (password.length < 8) {
                throw new ApiError(
                    401,
                    "invalid_credentials",
                    "Identifiants invalides",
                );
            }
            return signIn(email);
        },
        async register({ email, name }) {
            return signIn(email, name);
        },
        async me() {
            if (!current) {
                // A stored mock token survives app restarts: rebuild a user.
                return signIn("demo@traily.app").user;
            }
            return current;
        },
    };
}
