import { useEffect, useEffectEvent } from "react";

import { useSimulationScenario } from "./use-simulation-scenario";
import { getElapsedMs } from "../services/hike-metrics";
import { getHikeSession, recordFix } from "../services/hike-session";
import { FIX_INTERVAL_MS, simulateFix } from "../services/location-simulator";
import type { HikeStatus, LngLat } from "../types";

/**
 * Feeds the hike with a simulated GPS fix every second while it runs, along
 * the scenario chosen in the settings.
 *
 * TODO(gps): replaced by the location service (TRA-76), which will call
 * `recordFix` with the real fixes.
 */
export function useSimulatedLocation(
    status: HikeStatus,
    route: LngLat[] | undefined,
) {
    const scenario = useSimulationScenario();
    const running = status === "running" && route !== undefined;

    const tick = useEffectEvent(() => {
        if (!route) return;
        const elapsedMs = getElapsedMs(getHikeSession(), Date.now());
        recordFix(simulateFix(route, scenario, elapsedMs), route);
    });

    useEffect(() => {
        if (!running) return;
        // A first fix right away: the walker shows up at the start.
        tick();
        const interval = setInterval(tick, FIX_INTERVAL_MS);
        return () => clearInterval(interval);
    }, [running]);
}
