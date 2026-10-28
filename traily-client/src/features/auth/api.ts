import type { ApiClient } from "@/lib/api/client";

import type { AuthApi, AuthResult, User } from "./types";

export interface UserDto {
    id: string;
    email: string;
    name?: string | null;
    username?: string | null;
    display_name?: string | null;
    avatar_url?: string | null;
}

export interface AuthResponseDto {
    access_token: string;
    refresh_token: string;
    user: UserDto;
}

export function mapUser(dto: UserDto): User {
    return {
        id: dto.id,
        email: dto.email,
        username: dto.username ?? null,
        // Users only give a name at sign-up; display_name is set later in the profile.
        displayName: dto.display_name ?? dto.name ?? null,
        avatarUrl: dto.avatar_url ?? null,
    };
}

export function mapAuthResponse(dto: AuthResponseDto): AuthResult {
    return {
        user: mapUser(dto.user),
        accessToken: dto.access_token,
        refreshToken: dto.refresh_token,
    };
}

export function createAuthApi(client: ApiClient): AuthApi {
    return {
        async login(input) {
            const dto = await client.request<AuthResponseDto>("/auth/login", {
                method: "POST",
                body: input,
                auth: false,
            });
            return mapAuthResponse(dto);
        },
        async register(input) {
            const dto = await client.request<AuthResponseDto>(
                "/auth/register",
                { method: "POST", body: input, auth: false },
            );
            return mapAuthResponse(dto);
        },
        async me() {
            return mapUser(await client.request<UserDto>("/users/me"));
        },
    };
}
