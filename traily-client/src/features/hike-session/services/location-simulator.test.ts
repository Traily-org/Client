import { describe, expect, it } from "vitest";

import { addFix, NO_TRACKING } from "./hike-tracking";
import {
    buildSimulatedWalk,
    FIX_INTERVAL_MS,
    type SimulationScenario,
    simulateFix,
} from "./location-simulator";
import { measureLine, offsetBy } from "./polyline";
import type { HikeTracking, LngLat } from "../types";

const START: LngLat = [6.1, 45.9];
/** 2 km due north. */
const ROUTE: LngLat[] = [START, offsetBy(START, 0, 2000)];
const SECOND = 1000;

/** Plays a whole scenario through the tracking, a fix a second. */
function play(scenario: SimulationScenario) {
    const walk = measureLine(buildSimulatedWalk(ROUTE, scenario));
    const seconds = Math.ceil(walk.length / (4 / 3.6)) + 5;
    let tracking: HikeTracking = NO_TRACKING;
    let wentOff = false;
    for (let s = 0; s <= seconds; s++) {
        tracking = addFix(
            tracking,
            simulateFix(ROUTE, scenario, s * FIX_INTERVAL_MS),
            ROUTE,
        );
        wentOff ||= tracking.offTrail;
    }
    return { tracking, wentOff };
}

describe("location simulator", () => {
    it("gives the same fix for the same time", () => {
        expect(simulateFix(ROUTE, "follow", 61 * SECOND)).toEqual(
            simulateFix(ROUTE, "follow", 61_500),
        );
    });

    it("walks at 4 km/h with a few meters of noise", () => {
        const fix = simulateFix(ROUTE, "follow", 900 * SECOND);
        // 1 km after 15 minutes.
        const expected = offsetBy(START, 0, 1000);
        expect(Math.abs(fix.lngLat[1] - expected[1]) * 111_320).toBeLessThan(4);
    });

    it("stays on the trail when following it", () => {
        const { tracking, wentOff } = play("follow");
        expect(wentOff).toBe(false);
        expect(tracking.progressM).toBeGreaterThan(1990);
        // The noise barely adds to the 2 km walked.
        expect(tracking.distanceM).toBeGreaterThan(1950);
        expect(tracking.distanceM).toBeLessThan(2200);
    });

    it("leaves and rejoins the trail on a detour", () => {
        const { tracking, wentOff } = play("detour");
        expect(wentOff).toBe(true);
        expect(tracking.offTrail).toBe(false);
        expect(tracking.progressM).toBeGreaterThan(1990);
        expect(tracking.distanceM).toBeGreaterThan(2000);
    });

    it("turns back, then goes around on a blocked path", () => {
        const { tracking, wentOff } = play("blocked");
        expect(wentOff).toBe(true);
        expect(tracking.offTrail).toBe(false);
        expect(tracking.progressM).toBeGreaterThan(1990);
    });

    it("lets the tracking drop the GPS glitches", () => {
        const { tracking, wentOff } = play("glitch");
        expect(wentOff).toBe(false);
        expect(tracking.progressM).toBeGreaterThan(1990);
        // No 2 km jump in the track.
        expect(tracking.distanceM).toBeLessThan(2300);
    });
});
