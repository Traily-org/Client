import { describe, expect, it } from "vitest";

import { getRouteProgress } from "./route-progress";
import type { LngLat } from "../types";

// At the equator, a degree of longitude is as long as one of latitude.
const NORTH_THEN_EAST: LngLat[] = [
    [0, 0],
    [0, 1],
    [1, 1],
];

describe("route progress", () => {
    it("starts at the first point, facing the first segment", () => {
        const progress = getRouteProgress(NORTH_THEN_EAST, 0);
        expect(progress.position).toEqual([0, 0]);
        expect(progress.heading).toBeCloseTo(0);
    });

    it("walks along the route by length, not by point", () => {
        const progress = getRouteProgress(NORTH_THEN_EAST, 0.25);
        expect(progress.position[0]).toBeCloseTo(0);
        expect(progress.position[1]).toBeCloseTo(0.5);
        expect(progress.walked).toEqual([[0, 0], progress.position]);
    });

    it("faces the segment the walker is on", () => {
        const progress = getRouteProgress(NORTH_THEN_EAST, 0.75);
        expect(progress.position[0]).toBeCloseTo(0.5);
        expect(progress.position[1]).toBeCloseTo(1);
        expect(progress.heading).toBeCloseTo(90);
        expect(progress.walked).toHaveLength(3);
    });

    it("stops at the end, the whole route walked", () => {
        const progress = getRouteProgress(NORTH_THEN_EAST, 1.5);
        expect(progress.position).toEqual([1, 1]);
        expect(progress.heading).toBeCloseTo(90);
        expect(progress.walked).toEqual(NORTH_THEN_EAST);
    });

    it("gives headings between 0 and 360 degrees", () => {
        const southWest: LngLat[] = [
            [0, 0],
            [-1, -1],
        ];
        expect(getRouteProgress(southWest, 0.5).heading).toBeCloseTo(225);
    });

    it("keeps the previous heading over a repeated point", () => {
        const route: LngLat[] = [
            [0, 0],
            [0, 1],
            [0, 1],
        ];
        expect(getRouteProgress(route, 1).heading).toBeCloseTo(0);
    });

    it("shrinks longitudes with the latitude", () => {
        // At 60°, a degree of longitude is half as long: this goes north-east.
        const route: LngLat[] = [
            [0, 60],
            [2, 61],
        ];
        expect(getRouteProgress(route, 0.5).heading).toBeCloseTo(45, 0);
    });
});
