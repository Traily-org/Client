import type { HikeSession, HikeTrail, LngLat, LocationFix } from "../types";
import { getElapsedMs } from "./hike-metrics";
import { addFix, NO_TRACKING } from "./hike-tracking";

// Current hike, shared by the map overlay and the hike controls. In memory
// only until the app has a persisted store: a relaunch loses the hike.
const IDLE: HikeSession = {
    trail: null,
    status: "idle",
    elapsedBeforeMs: 0,
    runningSince: null,
    tracking: NO_TRACKING,
};

let session = IDLE;
const listeners = new Set<() => void>();

function update(next: HikeSession) {
    session = next;
    listeners.forEach((listener) => listener());
}

export function subscribeHikeSession(listener: () => void) {
    listeners.add(listener);
    return () => {
        listeners.delete(listener);
    };
}

export function getHikeSession(): HikeSession {
    return session;
}

/** Picks the trail the next hike follows. Ignored once the hike started. */
export function selectHikeTrail(trail: HikeTrail) {
    if (session.status !== "idle") return;
    const { id, name, distanceKm, elevationGainM } = trail;
    update({ ...session, trail: { id, name, distanceKm, elevationGainM } });
}

export function clearHikeTrail() {
    if (session.status !== "idle") return;
    update({ ...session, trail: null });
}

/** Starts the hike on the picked trail. Ignored without one. */
export function startHike(now = Date.now()) {
    if (session.status !== "idle" || !session.trail) return;
    update({
        ...session,
        status: "running",
        elapsedBeforeMs: 0,
        runningSince: now,
        tracking: NO_TRACKING,
    });
}

/**
 * Adds a GPS fix to the hike, matched against the trail's `route`. Ignored
 * unless the hike runs: no track while paused.
 */
export function recordFix(fix: LocationFix, route: LngLat[]) {
    if (session.status !== "running") return;
    const tracking = addFix(session.tracking, fix, route);
    if (tracking !== session.tracking) update({ ...session, tracking });
}

export function pauseHike(now = Date.now()) {
    if (session.status !== "running") return;
    update({
        ...session,
        status: "paused",
        elapsedBeforeMs: getElapsedMs(session, now),
        runningSince: null,
    });
}

export function resumeHike(now = Date.now()) {
    if (session.status !== "paused") return;
    update({ ...session, status: "running", runningSince: now });
}

/** Ends the hike and forgets its trail. */
export function endHike() {
    update(IDLE);
}
