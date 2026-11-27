import { API_TIMEOUT_MS, API_URL } from "@/constants/config";
import { secureTokenStore } from "@/lib/secure-storage";
import { setAnonymous } from "@/store/session";

import { createApiClient } from "./client";

export const apiClient = createApiClient({
    baseUrl: API_URL,
    timeoutMs: API_TIMEOUT_MS,
    tokens: secureTokenStore,
    onSessionExpired: setAnonymous,
});

export { ApiError } from "./client";
export type { ApiClient, RequestOptions } from "./client";
