import type { LngLat } from "../types";

/**
 * Geometry of routes and tracks in meters, on a flat frame around their
 * first point: accurate enough over the few kilometers of a hike.
 */

const METERS_PER_DEGREE = 111_320;

type Point = [number, number];

/** Flat frame in meters (x east, y north) around `origin`. */
interface Frame {
    origin: LngLat;
    metersPerDegreeLng: number;
}

function frameAt(origin: LngLat): Frame {
    return {
        origin,
        metersPerDegreeLng:
            METERS_PER_DEGREE * Math.cos((origin[1] * Math.PI) / 180),
    };
}

function toPoint({ origin, metersPerDegreeLng }: Frame, [lng, lat]: LngLat) {
    return [
        (lng - origin[0]) * metersPerDegreeLng,
        (lat - origin[1]) * METERS_PER_DEGREE,
    ] as Point;
}

function toLngLat({ origin, metersPerDegreeLng }: Frame, [x, y]: Point) {
    return [
        origin[0] + x / metersPerDegreeLng,
        origin[1] + y / METERS_PER_DEGREE,
    ] as LngLat;
}

/** Bearing of a flat vector, in degrees clockwise from north, 0-360. */
function vectorBearing(dx: number, dy: number): number {
    return ((Math.atan2(dx, dy) * 180) / Math.PI + 360) % 360;
}

export function metersBetween(a: LngLat, b: LngLat): number {
    const [x, y] = toPoint(frameAt(a), b);
    return Math.hypot(x, y);
}

/** Bearing from `a` to `b`, in degrees clockwise from north, 0-360. */
export function bearingBetween(a: LngLat, b: LngLat): number {
    const [x, y] = toPoint(frameAt(a), b);
    return vectorBearing(x, y);
}

/** Smallest angle between two bearings, 0-180. */
export function angleBetween(a: number, b: number): number {
    const diff = Math.abs(a - b) % 360;
    return diff > 180 ? 360 - diff : diff;
}

/** `point` moved by `east` and `north` meters. */
export function offsetBy(point: LngLat, east: number, north: number): LngLat {
    return toLngLat(frameAt(point), [east, north]);
}

/** A line measured once, to walk along it or match points to it. */
export interface MeasuredLine {
    points: LngLat[];
    frame: Frame;
    xy: Point[];
    /** Distance from the start to each point, in meters. */
    cumulative: number[];
    length: number;
}

// Routes are measured again and again while hiking: once per route array.
const measured = new WeakMap<LngLat[], MeasuredLine>();

export function measureLine(points: LngLat[]): MeasuredLine {
    const cached = measured.get(points);
    if (cached) return cached;
    if (points.length === 0) throw new Error("A line needs a point");
    const frame = frameAt(points[0]);
    const xy = points.map((point) => toPoint(frame, point));
    const cumulative = [0];
    for (let i = 1; i < xy.length; i++) {
        const [x0, y0] = xy[i - 1];
        const [x1, y1] = xy[i];
        cumulative.push(cumulative[i - 1] + Math.hypot(x1 - x0, y1 - y0));
    }
    const line = {
        points,
        frame,
        xy,
        cumulative,
        length: cumulative[cumulative.length - 1],
    };
    measured.set(points, line);
    return line;
}

/** Index of the segment holding `distance`: from point i - 1 to point i. */
function segmentAt(line: MeasuredLine, distance: number): number {
    for (let i = 1; i < line.xy.length; i++) {
        if (distance <= line.cumulative[i]) return i;
    }
    return line.xy.length - 1;
}

/** Bearing of segment i (from point i - 1), or of the last one with one. */
function segmentBearing(line: MeasuredLine, i: number): number {
    for (let j = i; j >= 1; j--) {
        const [x0, y0] = line.xy[j - 1];
        const [x1, y1] = line.xy[j];
        if (x0 !== x1 || y0 !== y1) return vectorBearing(x1 - x0, y1 - y0);
    }
    return 0;
}

/** Point `distance` meters from the start, facing along the line. */
export function pointAtDistance(
    line: MeasuredLine,
    distance: number,
): { point: LngLat; heading: number } {
    if (line.xy.length === 1) return { point: line.points[0], heading: 0 };
    const d = Math.min(Math.max(distance, 0), line.length);
    const i = segmentAt(line, d);
    const span = line.cumulative[i] - line.cumulative[i - 1];
    const t = span > 0 ? (d - line.cumulative[i - 1]) / span : 0;
    const [x0, y0] = line.xy[i - 1];
    const [x1, y1] = line.xy[i];
    return {
        point: toLngLat(line.frame, [x0 + (x1 - x0) * t, y0 + (y1 - y0) * t]),
        heading: segmentBearing(line, i),
    };
}

/**
 * Part of the line between two distances from its start, in walking order:
 * reversed when `from` is past `to`.
 */
export function sliceLine(
    line: MeasuredLine,
    from: number,
    to: number,
): LngLat[] {
    const start = Math.min(from, to);
    const end = Math.max(from, to);
    const slice = [pointAtDistance(line, start).point];
    for (let i = 0; i < line.points.length; i++) {
        const d = line.cumulative[i];
        if (d > start && d < end) slice.push(line.points[i]);
    }
    slice.push(pointAtDistance(line, end).point);
    return from <= to ? slice : slice.reverse();
}

/**
 * The line moved sideways by `meters`: to the left of the walking direction
 * when positive, to the right when negative.
 */
export function offsetLine(points: LngLat[], meters: number): LngLat[] {
    const line = measureLine(points);
    return line.xy.map((_, i) => {
        // Direction around the point: from its neighbors.
        const [xa, ya] = line.xy[Math.max(i - 1, 0)];
        const [xb, yb] = line.xy[Math.min(i + 1, line.xy.length - 1)];
        const length = Math.hypot(xb - xa, yb - ya) || 1;
        const [x, y] = line.xy[i];
        return toLngLat(line.frame, [
            x - ((yb - ya) / length) * meters,
            y + ((xb - xa) / length) * meters,
        ]);
    });
}

/** Closest point of a line to a position. */
export interface LineMatch {
    /** Distance of the closest point from the line's start, in meters. */
    along: number;
    /** Distance from the position to the line, in meters. */
    distance: number;
    point: LngLat;
    /** Direction of the line at the closest point. */
    heading: number;
}

/**
 * Closest point of the line to `position`, looking only between `from` and
 * `to` meters from its start (e.g. around the walker's progress, so a loop
 * closing near its start doesn't match its end).
 */
export function matchOnLine(
    line: MeasuredLine,
    position: LngLat,
    from = 0,
    to = Infinity,
): LineMatch {
    const [px, py] = toPoint(line.frame, position);
    let best: LineMatch | null = null;
    for (let i = 1; i < line.xy.length; i++) {
        const start = line.cumulative[i - 1];
        const end = line.cumulative[i];
        if (end < from || start > to) continue;
        const [x0, y0] = line.xy[i - 1];
        const [x1, y1] = line.xy[i];
        const span = end - start;
        let t =
            span > 0
                ? ((px - x0) * (x1 - x0) + (py - y0) * (y1 - y0)) / span ** 2
                : 0;
        // Kept inside both the segment and the window.
        const tMin = span > 0 ? Math.max(0, (from - start) / span) : 0;
        const tMax = span > 0 ? Math.min(1, (to - start) / span) : 0;
        t = Math.min(Math.max(t, tMin), tMax);
        const x = x0 + (x1 - x0) * t;
        const y = y0 + (y1 - y0) * t;
        const distance = Math.hypot(px - x, py - y);
        if (!best || distance < best.distance) {
            best = {
                along: start + span * t,
                distance,
                point: toLngLat(line.frame, [x, y]),
                heading: segmentBearing(line, i),
            };
        }
    }
    if (best) return best;
    // A single point, or a window past the line: its nearest end.
    const end = pointAtDistance(line, Math.min(Math.max(from, 0), line.length));
    return {
        along: Math.min(Math.max(from, 0), line.length),
        distance: metersBetween(position, end.point),
        point: end.point,
        heading: end.heading,
    };
}
