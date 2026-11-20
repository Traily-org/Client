import type { LngLat } from "../types";

/** Where the walker stands on the route, and what lies behind them. */
export interface RouteProgress {
    position: LngLat;
    /** Direction of the route there, in degrees clockwise from north. */
    heading: number;
    /** Route from its start up to the walker, start first. */
    walked: LngLat[];
}

/** Bearing from `a` to `b`, longitudes shrunk by `shrink`, in 0-360°. */
function bearing([lng0, lat0]: LngLat, [lng1, lat1]: LngLat, shrink: number) {
    const degrees =
        (Math.atan2((lng1 - lng0) * shrink, lat1 - lat0) * 180) / Math.PI;
    return (degrees + 360) % 360;
}

/**
 * Walker at `fraction` (0 = start, 1 = end) of the route's length, facing
 * along the route. Distances are measured in degrees with longitude shrunk
 * to the route's latitude, which is accurate enough over a hike.
 */
export function getRouteProgress(
    route: LngLat[],
    fraction: number,
): RouteProgress {
    if (route.length === 0) throw new Error("A route needs a point");
    const shrink = Math.cos((route[0][1] * Math.PI) / 180);
    const lengths = route
        .slice(1)
        .map(([lng, lat], i) =>
            Math.hypot((lng - route[i][0]) * shrink, lat - route[i][1]),
        );
    const total = lengths.reduce((sum, length) => sum + length, 0);
    let remaining = Math.min(Math.max(fraction, 0), 1) * total;
    let heading = 0;
    for (let i = 1; i < route.length; i++) {
        const length = lengths[i - 1];
        // A repeated point has no direction: keep the previous one.
        if (length === 0) continue;
        heading = bearing(route[i - 1], route[i], shrink);
        if (remaining <= length) {
            const t = remaining / length;
            const [lng0, lat0] = route[i - 1];
            const [lng1, lat1] = route[i];
            const position: LngLat = [
                lng0 + (lng1 - lng0) * t,
                lat0 + (lat1 - lat0) * t,
            ];
            return {
                position,
                heading,
                walked: [...route.slice(0, i), position],
            };
        }
        remaining -= length;
    }
    return {
        position: route[route.length - 1],
        heading,
        walked: [...route],
    };
}
