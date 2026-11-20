import { useState } from "react";

import type { MapHike } from "@/features/map";

import { useHikeSession } from "./use-hike-session";
import { useOffTrailFeedback } from "./use-off-trail-feedback";
import { useSimulatedLocation } from "./use-simulated-location";
import { measureLine, pointAtDistance, sliceLine } from "../services/polyline";
import type { LngLat } from "../types";

/**
 * Hike in progress as the home map shows it: the walker, their own track,
 * the part of the planned route behind them, and whether the camera
 * follows them. Following stops when the map is moved by hand and comes
 * back with `recenter`, or each time the hike starts or resumes. Feeds the
 * hike with GPS fixes (simulated until TRA-76) and vibrates when the walker
 * leaves or rejoins the route.
 */
export function useHikeMap(route: LngLat[] | undefined) {
    const session = useHikeSession();
    const running = session.status === "running";
    const active = session.status !== "idle";
    const [following, setFollowing] = useState(true);
    const [wasRunning, setWasRunning] = useState(running);
    if (running !== wasRunning) {
        setWasRunning(running);
        if (running) setFollowing(true);
    }

    useSimulatedLocation(session.status, route);
    const tracking = session.tracking;
    useOffTrailFeedback(active ? tracking.offTrail : null);

    let hike: MapHike | undefined;
    if (active && session.trail && route && route.length >= 2) {
        const line = measureLine(route);
        // Before the first fix: at the start of the route.
        const start = pointAtDistance(line, 0);
        hike = {
            route,
            position: {
                lngLat: tracking.position ?? start.point,
                heading: tracking.position ? tracking.heading : start.heading,
            },
            walkedRoute: sliceLine(line, 0, tracking.progressM),
            track: tracking.track,
            paused: session.status === "paused",
            following,
        };
    }

    return {
        hike,
        /** Following stopped while running: show the recenter button. */
        canRecenter: hike !== undefined && running && !following,
        stopFollowing: () => setFollowing(false),
        recenter: () => setFollowing(true),
    };
}
