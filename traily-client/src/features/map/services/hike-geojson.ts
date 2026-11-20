export interface HikeFeatureCollection {
    type: "FeatureCollection";
    features: {
        type: "Feature";
        properties: Record<string, never>;
        geometry: { type: "LineString"; coordinates: [number, number][] };
    }[];
}

/**
 * Data of the hike source: the part of the route already walked, nothing
 * before the walker has moved (a line needs two points) or without a hike.
 */
export function toHikeGeoJSON(
    walkedRoute: [number, number][] | undefined,
): HikeFeatureCollection {
    if (!walkedRoute || walkedRoute.length < 2) {
        return { type: "FeatureCollection", features: [] };
    }
    return {
        type: "FeatureCollection",
        features: [
            {
                type: "Feature",
                properties: {},
                geometry: { type: "LineString", coordinates: walkedRoute },
            },
        ],
    };
}
