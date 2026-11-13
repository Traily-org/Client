import { useEffect, useState, useSyncExternalStore } from "react";

import { estimateDistanceKm, getElapsedMs } from "../services/hike-metrics";
import { getHikeSession, subscribeHikeSession } from "../services/hike-session";
import type { HikeSession } from "../types";

export function useHikeSession(): HikeSession {
    return useSyncExternalStore(
        subscribeHikeSession,
        getHikeSession,
        getHikeSession,
    );
}

/** Time walked and distance covered, refreshed every second while running. */
export function useHikeProgress(session: HikeSession) {
    const [now, setNow] = useState(() => Date.now());
    const running = session.status === "running";

    useEffect(() => {
        if (!running) return;
        const interval = setInterval(() => setNow(Date.now()), 1000);
        return () => clearInterval(interval);
    }, [running]);

    const elapsedMs = getElapsedMs(session, now);
    return {
        elapsedMs,
        distanceKm: estimateDistanceKm(elapsedMs, session.trail),
    };
}
