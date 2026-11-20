import { useState } from "react";

import type { MapHike } from "@/features/map";

import { useHikeProgress, useHikeSession } from "./use-hike-session";
import { getRouteProgress } from "../services/route-progress";
import type { LngLat } from "../types";

/**
 * Hike in progress as the home map shows it: the walker on the trail's
 * route, the part already walked, and whether the camera follows them.
 * Following stops when the map is moved by hand and comes back with
 * `recenter`, or each time the hike starts or resumes.
 */
export function useHikeMap(route: LngLat[] | undefined) {
    const session = useHikeSession();
    const { distanceKm } = useHikeProgress(session);
    const running = session.status === "running";
    const [following, setFollowing] = useState(true);
    const [wasRunning, setWasRunning] = useState(running);
    if (running !== wasRunning) {
        setWasRunning(running);
        if (running) setFollowing(true);
    }

    const trail = session.trail;
    let hike: MapHike | undefined;
    if (session.status !== "idle" && trail && route && route.length >= 2) {
        // TODO(gps): the walker moves along the route with the simulated
        // distance until the location service (TRA-76) gives the real one.
        const fraction =
            trail.distanceKm > 0 ? distanceKm / trail.distanceKm : 0;
        const progress = getRouteProgress(route, fraction);
        hike = {
            route,
            position: { lngLat: progress.position, heading: progress.heading },
            walkedRoute: progress.walked,
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
