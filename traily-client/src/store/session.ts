import { create } from "zustand";

import type { User } from "@/types/user";

export type SessionStatus = "loading" | "authenticated" | "anonymous";

interface SessionState {
    status: SessionStatus;
    user: User | null;
}

export const useSessionStore = create<SessionState>(() => ({
    status: "loading",
    user: null,
}));

export function setAuthenticated(user: User) {
    useSessionStore.setState({ status: "authenticated", user });
}

export function setAnonymous() {
    useSessionStore.setState({ status: "anonymous", user: null });
}
