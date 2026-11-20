import { useEffect, useState, useSyncExternalStore } from "react";

import { getElapsedMs, getProgressShare } from "../services/hike-metrics";
import { getHikeSession, subscribeHikeSession } from "../services/hike-session";
import type { HikeSession } from "../types";

export function useHikeSession(): HikeSession {
    return useSyncExternalStore(
        subscribeHikeSession,
        getHikeSession,
        getHikeSession,
    );
}

/**
 * Time walked, refreshed every second while running, distance walked
 * along the walker's own track (detours included), and share of the
 * planned route behind them.
 */
export function useHikeProgress(session: HikeSession) {
    const [now, setNow] = useState(() => Date.now());
    const running = session.status === "running";

    useEffect(() => {
        if (!running) return;
        const interval = setInterval(() => setNow(Date.now()), 1000);
        return () => clearInterval(interval);
    }, [running]);

    return {
        elapsedMs: getElapsedMs(session, now),
        distanceKm: session.tracking.distanceM / 1000,
        progressShare: getProgressShare(session.tracking),
    };
}
