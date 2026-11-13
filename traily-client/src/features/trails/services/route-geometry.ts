import type { LngLat } from "../types";

const KM_PER_DEGREE = 111.32;

type Point = [number, number];

function distance([x0, y0]: Point, [x1, y1]: Point): number {
    return Math.hypot(x1 - x0, y1 - y0);
}

/** Length of a polyline, in the units of its points. */
export function pathLength(points: Point[]): number {
    let length = 0;
    for (let i = 1; i < points.length; i++) {
        length += distance(points[i - 1], points[i]);
    }
    return length;
}

/**
 * Rounds a polyline by cutting its corners (Chaikin), keeping both ends.
 * Each pass doubles the number of points.
 */
export function smoothPath(points: Point[], passes = 2): Point[] {
    let path = points;
    for (let pass = 0; pass < passes; pass++) {
        if (path.length < 3) return path;
        const next: Point[] = [path[0]];
        for (let i = 1; i < path.length; i++) {
            const [x0, y0] = path[i - 1];
            const [x1, y1] = path[i];
            next.push([0.75 * x0 + 0.25 * x1, 0.75 * y0 + 0.25 * y1]);
            next.push([0.25 * x0 + 0.75 * x1, 0.25 * y0 + 0.75 * y1]);
        }
        next.push(path[path.length - 1]);
        path = next;
    }
    return path;
}

/**
 * Lays a 0-1 sketch (y pointing down) on the ground from `start`, scaled so
 * the line is `distanceKm` long. Stands in for real route geometry in the
 * mock data.
 */
export function routeFromSketch(
    sketch: Point[],
    start: LngLat,
    distanceKm: number,
): LngLat[] {
    const path = smoothPath(sketch);
    const kmPerUnit = distanceKm / pathLength(path);
    const [x0, y0] = path[0];
    const kmPerDegreeLng = KM_PER_DEGREE * Math.cos((start[1] * Math.PI) / 180);
    return path.map(([x, y]) => [
        start[0] + ((x - x0) * kmPerUnit) / kmPerDegreeLng,
        start[1] - ((y - y0) * kmPerUnit) / KM_PER_DEGREE,
    ]);
}

/**
 * Point at `fraction` (0 = start, 1 = end) of the route's length. Distances
 * are measured in degrees with longitude shrunk to the route's latitude,
 * which is accurate enough over a hike.
 */
export function pointAlongRoute(route: LngLat[], fraction: number): LngLat {
    const shrink = Math.cos((route[0][1] * Math.PI) / 180);
    const flat = route.map(([lng, lat]): Point => [lng * shrink, lat]);
    let remaining = Math.min(Math.max(fraction, 0), 1) * pathLength(flat);
    for (let i = 1; i < flat.length; i++) {
        const segment = distance(flat[i - 1], flat[i]);
        if (remaining <= segment && segment > 0) {
            const t = remaining / segment;
            const [lng0, lat0] = route[i - 1];
            const [lng1, lat1] = route[i];
            return [lng0 + (lng1 - lng0) * t, lat0 + (lat1 - lat0) * t];
        }
        remaining -= segment;
    }
    return route[route.length - 1];
}
