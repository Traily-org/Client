import { describe, expect, it } from "vitest";

import {
    addFix,
    BACK_ON_TRAIL_FIXES,
    isGlitch,
    NO_TRACKING,
    OFF_TRAIL_FIXES,
} from "./hike-tracking";
import { offsetBy } from "./polyline";
import type { HikeTracking, LngLat, LocationFix } from "../types";

const START: LngLat = [6.1, 45.9];
/** 2 km due north. */
const ROUTE: LngLat[] = [START, offsetBy(START, 0, 2000)];

/** Point `north` meters up the route, `east` meters aside. */
function at(north: number, east = 0): LngLat {
    return offsetBy(START, east, north);
}

function fix(lngLat: LngLat, seconds: number, accuracyM = 5): LocationFix {
    return { lngLat, accuracyM, timestamp: seconds * 1000 };
}

/** Adds fixes 10 s apart (walking pace for steps under 40 m). */
function walk(
    points: LngLat[],
    tracking = NO_TRACKING,
    startSeconds = 0,
): HikeTracking {
    return points.reduce(
        (current, point, i) =>
            addFix(current, fix(point, startSeconds + i * 10), ROUTE),
        tracking,
    );
}

describe("hike tracking", () => {
    it("moves along the route and records the walker's track", () => {
        const tracking = walk([at(0), at(10, 3), at(20, -2), at(30)]);
        expect(tracking.progressM).toBeCloseTo(30, 0);
        expect(tracking.routeLengthM).toBeCloseTo(2000, 0);
        expect(tracking.track).toHaveLength(4);
        expect(tracking.distanceM).toBeGreaterThan(30);
        expect(tracking.offTrail).toBe(false);
        // Drawn on the route, not where the noisy fix was.
        expect(tracking.position?.[0]).toBeCloseTo(START[0]);
    });

    it("doesn't count the GPS noise as distance when standing still", () => {
        const still = [at(0), at(2, 1), at(-1, -2), at(1, 2), at(0, -1)];
        const tracking = walk(still);
        expect(tracking.distanceM).toBe(0);
        expect(tracking.track).toHaveLength(1);
    });

    it("drops imprecise fixes and fixes too far to be walked", () => {
        const last = fix(at(0), 0);
        expect(isGlitch(fix(at(10), 10, 80), last)).toBe(true);
        expect(isGlitch(fix(at(2000), 10), last)).toBe(true);
        expect(isGlitch(fix(at(30), 10), last)).toBe(false);
        // Far enough in time, a real jump goes through.
        expect(isGlitch(fix(at(2000), 600), last)).toBe(false);

        const tracking = walk([at(0), at(10)]);
        expect(addFix(tracking, fix(at(10, 2000), 20), ROUTE)).toBe(tracking);
    });

    it("goes off the trail after a few fixes away, back after a few near", () => {
        let tracking = walk([at(0), at(20)]);
        const away = [at(30, 30), at(40, 35), at(50, 35), at(60, 35)];
        tracking = walk(away.slice(0, OFF_TRAIL_FIXES - 1), tracking, 20);
        expect(tracking.offTrail).toBe(false);
        tracking = walk(away.slice(OFF_TRAIL_FIXES - 1), tracking, 40);
        expect(tracking.offTrail).toBe(true);
        expect(tracking.distanceToRouteM).toBeCloseTo(35, 0);

        const back = [at(70, 5), at(80), at(90)];
        tracking = walk(back.slice(0, BACK_ON_TRAIL_FIXES - 1), tracking, 80);
        expect(tracking.offTrail).toBe(true);
        tracking = walk(back.slice(BACK_ON_TRAIL_FIXES - 1), tracking, 100);
        expect(tracking.offTrail).toBe(false);
    });

    it("ignores one stray fix past the threshold", () => {
        const tracking = walk([at(0), at(10), at(20, 40), at(30)]);
        expect(tracking.offTrail).toBe(false);
    });

    it("skips the part of the route left out by a detour", () => {
        let tracking = walk([at(0), at(30), at(60)]);
        // Around a blocked bit, 50 m aside, back on the route at 400 m.
        const detour = [100, 140, 180, 220, 260, 300, 340, 380].map((n) =>
            at(n, 50),
        );
        tracking = walk(detour, tracking, 30);
        expect(tracking.offTrail).toBe(true);
        expect(tracking.progressM).toBeCloseTo(60, 0);
        tracking = walk([at(400), at(410), at(420)], tracking, 120);
        expect(tracking.offTrail).toBe(false);
        expect(tracking.progressM).toBeCloseTo(420, 0);
    });

    it("never moves the progress back on a U-turn", () => {
        let tracking = walk([at(0), at(30), at(60), at(90)]);
        tracking = walk([at(70), at(50), at(30)], tracking, 40);
        expect(tracking.progressM).toBeCloseTo(90, 0);
        // Walking the route backwards: facing south.
        expect(tracking.heading).toBeCloseTo(180);
    });

    it("faces the route on it, the way walked off it", () => {
        let tracking = walk([at(0), at(30)]);
        expect(tracking.heading).toBeCloseTo(0);
        tracking = walk(
            [at(30, 25), at(30, 50), at(30, 75), at(30, 100)],
            tracking,
            20,
        );
        expect(tracking.offTrail).toBe(true);
        expect(tracking.heading).toBeCloseTo(90, 0);
    });

    it("doesn't match the end of a loop closing near its start", () => {
        const loop: LngLat[] = [
            START,
            offsetBy(START, 0, 500),
            offsetBy(START, 500, 500),
            offsetBy(START, 500, 0),
            offsetBy(START, 15, 0),
        ];
        const tracking = addFix(NO_TRACKING, fix(at(0), 0), loop);
        expect(tracking.progressM).toBeCloseTo(0, 0);
    });
});
