import { describe, expect, it } from "vitest";

import {
    angleBetween,
    bearingBetween,
    matchOnLine,
    measureLine,
    metersBetween,
    offsetBy,
    offsetLine,
    pointAtDistance,
    sliceLine,
} from "./polyline";
import type { LngLat } from "../types";

const START: LngLat = [6.1, 45.9];
const NORTH = offsetBy(START, 0, 1000);
const NORTH_EAST = offsetBy(START, 1000, 1000);
/** 1 km north, then 1 km east. */
const ROUTE: LngLat[] = [START, NORTH, NORTH_EAST];

describe("polyline", () => {
    it("measures distances and bearings in meters", () => {
        expect(metersBetween(START, NORTH)).toBeCloseTo(1000, 0);
        expect(bearingBetween(START, NORTH)).toBeCloseTo(0);
        expect(bearingBetween(NORTH, NORTH_EAST)).toBeCloseTo(90);
        expect(angleBetween(350, 10)).toBe(20);
    });

    it("walks along a line by length", () => {
        const line = measureLine(ROUTE);
        expect(line.length).toBeCloseTo(2000, 0);
        const halfway = pointAtDistance(line, 1500);
        expect(
            metersBetween(halfway.point, offsetBy(START, 500, 1000)),
        ).toBeLessThan(0.5);
        expect(halfway.heading).toBeCloseTo(90);
        expect(pointAtDistance(line, 5000).point).toEqual(NORTH_EAST);
    });

    it("slices a line, reversed when walking it back", () => {
        const line = measureLine(ROUTE);
        const slice = sliceLine(line, 500, 1500);
        expect(slice).toHaveLength(3);
        expect(slice[1]).toEqual(NORTH);
        const back = sliceLine(line, 1500, 500);
        expect(back[0]).toEqual(slice[2]);
        expect(back[2]).toEqual(slice[0]);
    });

    it("moves a line sideways, to the left when positive", () => {
        const [start] = offsetLine([START, NORTH], 50);
        // Walking north, the left is west.
        expect(bearingBetween(START, start)).toBeCloseTo(270);
        expect(metersBetween(START, start)).toBeCloseTo(50, 0);
    });

    it("matches a position to the closest point of the line", () => {
        const line = measureLine(ROUTE);
        const match = matchOnLine(line, offsetBy(START, 30, 400));
        expect(match.along).toBeCloseTo(400, 0);
        expect(match.distance).toBeCloseTo(30, 0);
        expect(match.heading).toBeCloseTo(0);
    });

    it("only matches within the window it is given", () => {
        const line = measureLine(ROUTE);
        // Closest to the start, but the window starts at 800 m.
        const match = matchOnLine(line, START, 800, 1200);
        expect(match.along).toBeCloseTo(800, 0);
        expect(match.distance).toBeCloseTo(800, 0);
    });
});
