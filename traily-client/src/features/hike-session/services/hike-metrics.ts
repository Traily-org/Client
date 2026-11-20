import type { HikeSession, HikeTracking } from "../types";

/** Time walked so far, pauses excluded. */
export function getElapsedMs(session: HikeSession, now: number): number {
    const running =
        session.runningSince === null
            ? 0
            : Math.max(0, now - session.runningSince);
    return session.elapsedBeforeMs + running;
}

/** Share of the planned route behind the walker, 0-1. */
export function getProgressShare(tracking: HikeTracking): number {
    if (tracking.routeLengthM <= 0) return 0;
    return Math.min(tracking.progressM / tracking.routeLengthM, 1);
}

/** "4:07" under an hour, "1:04:07" after. */
export function formatElapsed(ms: number): string {
    const totalSeconds = Math.floor(ms / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = String(totalSeconds % 60).padStart(2, "0");
    if (hours === 0) return `${minutes}:${seconds}`;
    return `${hours}:${String(minutes).padStart(2, "0")}:${seconds}`;
}

/** "2,4 km", French decimal comma. */
export function formatDistanceKm(km: number): string {
    return `${km.toFixed(1).replace(".", ",")} km`;
}

/** "35 m" under a kilometer, "1,2 km" beyond. */
export function formatDistanceM(meters: number): string {
    if (meters < 1000) return `${Math.round(meters)} m`;
    return formatDistanceKm(meters / 1000);
}
