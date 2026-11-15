/** `[west, south, east, north]`, the order MapLibre takes bounds in. */
export type Bounds = [number, number, number, number];

/** Smallest box holding every `[longitude, latitude]` point. */
export function getBounds(points: [number, number][]): Bounds {
    let [west, south] = points[0];
    let [east, north] = points[0];
    for (const [lng, lat] of points) {
        west = Math.min(west, lng);
        east = Math.max(east, lng);
        south = Math.min(south, lat);
        north = Math.max(north, lat);
    }
    return [west, south, east, north];
}

/**
 * Grows a box on every side by `ratio` of its width and height, e.g. 0.5
 * makes it twice as wide and twice as tall.
 */
export function padBounds(
    [west, south, east, north]: Bounds,
    ratio: number,
): Bounds {
    const dx = (east - west) * ratio;
    const dy = (north - south) * ratio;
    return [west - dx, south - dy, east + dx, north + dy];
}

/** True when `inner` lies entirely inside `outer`, edges included. */
export function containsBounds(outer: Bounds, inner: Bounds): boolean {
    return (
        inner[0] >= outer[0] &&
        inner[1] >= outer[1] &&
        inner[2] <= outer[2] &&
        inner[3] <= outer[3]
    );
}

/** True when the two boxes overlap or touch. */
export function boundsIntersect(a: Bounds, b: Bounds): boolean {
    return a[0] <= b[2] && b[0] <= a[2] && a[1] <= b[3] && b[1] <= a[3];
}

/** What a map shows once it settled: its area and zoom level. */
export interface Viewport {
    bounds: Bounds;
    zoom: number;
}

/**
 * True when the segment from `a` to `b` has a part inside the box (clipped
 * with Liang-Barsky), edges included.
 */
function segmentCrossesBounds(
    [x0, y0]: [number, number],
    [x1, y1]: [number, number],
    [west, south, east, north]: Bounds,
): boolean {
    const dx = x1 - x0;
    const dy = y1 - y0;
    let enter = 0;
    let exit = 1;
    // Each pair: how the segment moves against one edge, and its room to it.
    const edges: [number, number][] = [
        [-dx, x0 - west],
        [dx, east - x0],
        [-dy, y0 - south],
        [dy, north - y0],
    ];
    for (const [p, q] of edges) {
        if (p === 0) {
            // Parallel to this edge: inside its side or out for good.
            if (q < 0) return false;
            continue;
        }
        const t = q / p;
        if (p < 0) enter = Math.max(enter, t);
        else exit = Math.min(exit, t);
        if (enter > exit) return false;
    }
    return true;
}

/**
 * True when a line of `[longitude, latitude]` points passes through the box,
 * even between two of its points.
 */
export function lineCrossesBounds(
    line: [number, number][],
    bounds: Bounds,
): boolean {
    if (line.length === 1)
        return containsBounds(bounds, [...line[0], ...line[0]]);
    for (let i = 1; i < line.length; i++) {
        if (segmentCrossesBounds(line[i - 1], line[i], bounds)) return true;
    }
    return false;
}
