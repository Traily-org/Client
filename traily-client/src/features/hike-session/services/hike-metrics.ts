import type { HikeSession, HikeTrail } from "../types";

// TODO(gps): distance simulated from the time walked until the location
// service exists.
const SIMULATED_SPEED_KMH = 4;

/** Time walked so far, pauses excluded. */
export function getElapsedMs(session: HikeSession, now: number): number {
    const running =
        session.runningSince === null
            ? 0
            : Math.max(0, now - session.runningSince);
    return session.elapsedBeforeMs + running;
}

/** Distance covered, capped at the trail's length when there is one. */
export function estimateDistanceKm(
    elapsedMs: number,
    trail: HikeTrail | null,
): number {
    const km = (elapsedMs / 3_600_000) * SIMULATED_SPEED_KMH;
    return trail ? Math.min(km, trail.distanceKm) : km;
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
