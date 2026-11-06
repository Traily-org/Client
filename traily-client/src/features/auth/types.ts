export interface User {
    id: string;
    email: string;
    username: string | null;
    displayName: string | null;
    avatarUrl: string | null;
}

export interface LoginInput {
    email: string;
    password: string;
}

export interface RegisterInput extends LoginInput {
    name: string;
}

export interface AuthResult {
    user: User;
    accessToken: string;
    refreshToken: string;
}

/** Contract shared by the HTTP implementation and the mock. */
export interface AuthApi {
    login(input: LoginInput): Promise<AuthResult>;
    register(input: RegisterInput): Promise<AuthResult>;
    /** Revokes the refresh token server-side. */
    logout(refreshToken: string): Promise<void>;
    me(): Promise<User>;
}
