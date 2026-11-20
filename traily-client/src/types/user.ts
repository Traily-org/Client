/** The signed-in user, shared by the session store and the auth feature. */
export interface User {
    id: string;
    email: string;
    username: string | null;
    displayName: string | null;
    avatarUrl: string | null;
}
