import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";

import type { Tokens, TokenStore } from "@/lib/api/client";

const ACCESS_KEY = "traily.accessToken";
const REFRESH_KEY = "traily.refreshToken";

// shortcut: expo-secure-store has no web implementation, so the web build
// keeps tokens in localStorage (readable by any script on the page); fine for
// dev previews, revisit if the web build ever ships to users.
const webTokenStore: TokenStore = {
    async get() {
        const accessToken = localStorage.getItem(ACCESS_KEY);
        const refreshToken = localStorage.getItem(REFRESH_KEY);
        return accessToken && refreshToken
            ? { accessToken, refreshToken }
            : null;
    },
    async set(tokens: Tokens) {
        localStorage.setItem(ACCESS_KEY, tokens.accessToken);
        localStorage.setItem(REFRESH_KEY, tokens.refreshToken);
    },
    async clear() {
        localStorage.removeItem(ACCESS_KEY);
        localStorage.removeItem(REFRESH_KEY);
    },
};

const nativeTokenStore: TokenStore = {
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

export const secureTokenStore: TokenStore =
    Platform.OS === "web" ? webTokenStore : nativeTokenStore;
