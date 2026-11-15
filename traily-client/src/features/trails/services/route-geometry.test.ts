import { describe, expect, it } from "vitest";

import {
    pathLength,
    pointAlongRoute,
    routeFromSketch,
    smoothPath,
} from "./route-geometry";

describe("smoothPath", () => {
    it("keeps both ends and doubles the points on each pass", () => {
        const path = smoothPath(
            [
                [0, 0],
                [1, 0],
                [1, 1],
            ],
            1,
        );
        expect(path[0]).toEqual([0, 0]);
        expect(path[path.length - 1]).toEqual([1, 1]);
        expect(path).toHaveLength(6);
    });

    it("leaves a straight segment alone", () => {
        const segment: [number, number][] = [
            [0, 0],
            [1, 1],
        ];
        expect(smoothPath(segment)).toBe(segment);
    });
});

describe("routeFromSketch", () => {
    const sketch: [number, number][] = [
        [0.1, 0.9],
        [0.5, 0.5],
        [0.9, 0.1],
    ];

    it("starts on the given point and heads north-east for an up-right sketch", () => {
        const route = routeFromSketch(sketch, [6.1, 45.9], 4);
        expect(route[0]).toEqual([6.1, 45.9]);
        const [lng, lat] = route[route.length - 1];
        expect(lng).toBeGreaterThan(6.1);
        expect(lat).toBeGreaterThan(45.9);
    });

    it("is as long as the trail distance", () => {
        const route = routeFromSketch(sketch, [6.1, 45.9], 4);
        const shrink = Math.cos((45.9 * Math.PI) / 180);
        const km = pathLength(
            route.map(([lng, lat]) => [lng * shrink * 111.32, lat * 111.32]),
        );
        expect(km).toBeCloseTo(4, 1);
    });
});

describe("pointAlongRoute", () => {
    const route: [number, number][] = [
        [6, 45],
        [6, 45.1],
        [6, 45.2],
    ];

    it("returns the ends for 0 and 1", () => {
        expect(pointAlongRoute(route, 0)).toEqual([6, 45]);
        expect(pointAlongRoute(route, 1)).toEqual([6, 45.2]);
    });

    it("interpolates inside a segment", () => {
        const [lng, lat] = pointAlongRoute(route, 0.75);
        expect(lng).toBe(6);
        expect(lat).toBeCloseTo(45.15);
    });

    it("clamps fractions outside 0-1", () => {
        expect(pointAlongRoute(route, 2)).toEqual([6, 45.2]);
    });
});
