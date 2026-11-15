import { describe, expect, it } from "vitest";

import {
    boundsIntersect,
    containsBounds,
    getBounds,
    lineCrossesBounds,
    padBounds,
} from "./bounds";

describe("lineCrossesBounds", () => {
    const box: [number, number, number, number] = [0, 0, 10, 10];

    it("detects a line with a point inside", () => {
        expect(
            lineCrossesBounds(
                [
                    [-5, -5],
                    [5, 5],
                ],
                box,
            ),
        ).toBe(true);
    });

    it("detects a segment crossing the box between two far points", () => {
        expect(
            lineCrossesBounds(
                [
                    [-20, 5],
                    [30, 5],
                ],
                box,
            ),
        ).toBe(true);
    });

    it("rejects a line passing beside the box", () => {
        expect(
            lineCrossesBounds(
                [
                    [-20, 12],
                    [30, 12],
                    [30, 40],
                ],
                box,
            ),
        ).toBe(false);
    });

    it("rejects a diagonal cutting past a corner", () => {
        expect(
            lineCrossesBounds(
                [
                    [8, 14],
                    [14, 8],
                ],
                box,
            ),
        ).toBe(false);
    });

    it("handles a single point", () => {
        expect(lineCrossesBounds([[5, 5]], box)).toBe(true);
        expect(lineCrossesBounds([[15, 5]], box)).toBe(false);
    });
});

describe("getBounds", () => {
    it("wraps every point as [west, south, east, north]", () => {
        expect(
            getBounds([
                [6.1, 45.9],
                [6.3, 45.8],
                [6.2, 46],
            ]),
        ).toEqual([6.1, 45.8, 6.3, 46]);
    });

    it("collapses to the point for a single point", () => {
        expect(getBounds([[6, 45]])).toEqual([6, 45, 6, 45]);
    });
});

describe("padBounds", () => {
    it("grows each side by the ratio of the width and height", () => {
        expect(padBounds([0, 10, 4, 12], 0.5)).toEqual([-2, 9, 6, 13]);
    });

    it("keeps the box as is with a zero ratio", () => {
        expect(padBounds([1, 2, 3, 4], 0)).toEqual([1, 2, 3, 4]);
    });
});

describe("containsBounds", () => {
    const outer: [number, number, number, number] = [0, 0, 10, 10];

    it("accepts a box inside, edges included", () => {
        expect(containsBounds(outer, [2, 2, 8, 8])).toBe(true);
        expect(containsBounds(outer, outer)).toBe(true);
    });

    it("rejects a box sticking out on any side", () => {
        expect(containsBounds(outer, [-1, 2, 8, 8])).toBe(false);
        expect(containsBounds(outer, [2, 2, 8, 11])).toBe(false);
    });
});

describe("boundsIntersect", () => {
    const box: [number, number, number, number] = [0, 0, 10, 10];

    it("detects overlapping and touching boxes", () => {
        expect(boundsIntersect(box, [5, 5, 15, 15])).toBe(true);
        expect(boundsIntersect(box, [10, 0, 12, 4])).toBe(true);
        expect(boundsIntersect(box, [2, 2, 3, 3])).toBe(true);
    });

    it("rejects boxes apart from each other", () => {
        expect(boundsIntersect(box, [11, 0, 12, 4])).toBe(false);
        expect(boundsIntersect(box, [0, -5, 10, -1])).toBe(false);
    });
});
