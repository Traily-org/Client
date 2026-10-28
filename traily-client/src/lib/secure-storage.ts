import * as SecureStore from "expo-secure-store";

import type { Tokens, TokenStore } from "@/lib/api/client";

const ACCESS_KEY = "traily.accessToken";
const REFRESH_KEY = "traily.refreshToken";

export const secureTokenStore: TokenStore = {
    async get() {
        const [accessToken, refreshToken] = await Promise.all([
            SecureStore.getItemAsync(ACCESS_KEY),
            SecureStore.getItemAsync(REFRESH_KEY),
        ]);
        return accessToken && refreshToken
            ? { accessToken, refreshToken }
            : null;
    },
    async set(tokens: Tokens) {
        await Promise.all([
            SecureStore.setItemAsync(ACCESS_KEY, tokens.accessToken),
            SecureStore.setItemAsync(REFRESH_KEY, tokens.refreshToken),
        ]);
    },
    async clear() {
        await Promise.all([
            SecureStore.deleteItemAsync(ACCESS_KEY),
            SecureStore.deleteItemAsync(REFRESH_KEY),
        ]);
    },
};
