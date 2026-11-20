import {
    measureLine,
    offsetBy,
    offsetLine,
    pointAtDistance,
    sliceLine,
} from "./polyline";
import type { LngLat, LocationFix } from "../types";

// TODO(gps): stands in for the location service until TRA-76, and stays
// for development on the web and the simulators.

/** Ways of walking a trail the simulator can play. */
export type SimulationScenario = "follow" | "detour" | "blocked" | "glitch";

/** Offered in the settings (development builds only), in display order. */
export const SIMULATION_SCENARIO_OPTIONS: readonly {
    value: SimulationScenario;
    label: string;
}[] = [
    { value: "follow", label: "Tracé suivi" },
    { value: "detour", label: "Détour" },
    { value: "blocked", label: "Chemin bloqué" },
    { value: "glitch", label: "GPS aberrant" },
];

/** Walking pace, in m/s (4 km/h). */
const WALK_SPEED_MPS = 4 / 3.6;
/** A fix every second, as a phone's GPS in the foreground. */
export const FIX_INTERVAL_MS = 1000;
const ACCURACY_M = 6;
/** GPS noise around the true position, in meters each way. */
const NOISE_M = 3;
/** How far a detour goes from the route, in meters. */
const DETOUR_M = 60;
const BLOCKED_DETOUR_M = 70;

/**
 * Error of the fix `index`, in -1..1, the same for the same inputs. It
 * drifts over tens of seconds, as a real GPS's does, rather than jumping
 * from one fix to the next.
 */
function noise(index: number, seed: number): number {
    return (
        0.6 * Math.sin(index / 17 + seed * 2.1) +
        0.4 * Math.sin(index / 41 + seed * 5.3)
    );
}

/**
 * Path the walker takes in a scenario, built from the route:
 * - follow, glitch: the route itself;
 * - detour: leaves the route at 30 % of its length, walks 60 m to its left
 *   and rejoins it at 45 %;
 * - blocked: walks to 35 %, turns back to 28 % (path blocked), then goes
 *   around 70 m to the right and rejoins it at 50 %.
 */
export function buildSimulatedWalk(
    route: LngLat[],
    scenario: SimulationScenario,
): LngLat[] {
    const line = measureLine(route);
    const at = (share: number) => share * line.length;
    switch (scenario) {
        case "follow":
        case "glitch":
            return route;
        case "detour":
            return [
                ...sliceLine(line, 0, at(0.3)),
                ...offsetLine(sliceLine(line, at(0.3), at(0.45)), DETOUR_M),
                ...sliceLine(line, at(0.45), line.length),
            ];
        case "blocked":
            return [
                ...sliceLine(line, 0, at(0.35)),
                ...sliceLine(line, at(0.35), at(0.28)),
                ...offsetLine(
                    sliceLine(line, at(0.28), at(0.5)),
                    -BLOCKED_DETOUR_M,
                ),
                ...sliceLine(line, at(0.5), line.length),
            ];
    }
}

// The walk of each scenario, built once per route.
const walks = new WeakMap<LngLat[], Map<SimulationScenario, LngLat[]>>();

function getWalk(route: LngLat[], scenario: SimulationScenario): LngLat[] {
    let byScenario = walks.get(route);
    if (!byScenario) {
        byScenario = new Map();
        walks.set(route, byScenario);
    }
    let walk = byScenario.get(scenario);
    if (!walk) {
        walk = buildSimulatedWalk(route, scenario);
        byScenario.set(scenario, walk);
    }
    return walk;
}

/**
 * GPS glitches of the glitch scenario: at 20 % of the walk, 3 fixes 2 km
 * away (too fast to be walked); at 50 %, 5 imprecise fixes 150 m aside.
 */
function withGlitch(
    fix: LocationFix,
    index: number,
    fixCount: number,
): LocationFix {
    const jump = Math.round(fixCount * 0.2);
    if (index >= jump && index < jump + 3) {
        return { ...fix, lngLat: offsetBy(fix.lngLat, 2000, 0), accuracyM: 8 };
    }
    const blur = Math.round(fixCount * 0.5);
    if (index >= blur && index < blur + 5) {
        return { ...fix, lngLat: offsetBy(fix.lngLat, 150, 0), accuracyM: 80 };
    }
    return fix;
}

/**
 * Fix the GPS would give after `elapsedMs` of walking (pauses excluded) in
 * the scenario: the walker's place along its path, with a few meters of
 * noise. The same time always gives the same fix.
 */
export function simulateFix(
    route: LngLat[],
    scenario: SimulationScenario,
    elapsedMs: number,
): LocationFix {
    const walk = measureLine(getWalk(route, scenario));
    const index = Math.floor(Math.max(elapsedMs, 0) / FIX_INTERVAL_MS);
    const timestamp = index * FIX_INTERVAL_MS;
    const { point } = pointAtDistance(
        walk,
        (WALK_SPEED_MPS * timestamp) / 1000,
    );
    const fix: LocationFix = {
        lngLat: offsetBy(
            point,
            noise(index, 1) * NOISE_M,
            noise(index, 2) * NOISE_M,
        ),
        accuracyM: ACCURACY_M,
        timestamp,
    };
    if (scenario !== "glitch") return fix;
    const fixCount = (walk.length / WALK_SPEED_MPS) * (1000 / FIX_INTERVAL_MS);
    return withGlitch(fix, index, fixCount);
}
