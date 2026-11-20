import { API_MOCK } from "@/constants/config";
import { apiClient } from "@/lib/api";
import { secureTokenStore } from "@/lib/secure-storage";

import { createAuthApi } from "./api";
import { createMockAuthApi } from "./mock";
import { createSessionService } from "./session";

export const authApi = API_MOCK
    ? createMockAuthApi()
    : createAuthApi(apiClient);
export const session = createSessionService(authApi, secureTokenStore);
