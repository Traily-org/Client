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
