/** Which line of the hike a feature draws, read by the hike layers. */
export type HikeLineKind = "walked" | "track";

export interface HikeFeatureCollection {
    type: "FeatureCollection";
    features: {
        type: "Feature";
        properties: { kind: HikeLineKind };
        geometry: { type: "LineString"; coordinates: [number, number][] };
    }[];
}

/**
 * Data of the hike source: the part of the route already walked, then the
 * walker's own track above it. A line needs two points: each one shows
 * once the walker has moved, and nothing shows without a hike.
 */
export function toHikeGeoJSON(
    walkedRoute: [number, number][] | undefined,
    track: [number, number][] | undefined,
): HikeFeatureCollection {
    const lines: [HikeLineKind, [number, number][] | undefined][] = [
        ["walked", walkedRoute],
        ["track", track],
    ];
    return {
        type: "FeatureCollection",
        features: lines
            .filter(
                (entry): entry is [HikeLineKind, [number, number][]] =>
                    (entry[1]?.length ?? 0) >= 2,
            )
            .map(([kind, coordinates]) => ({
                type: "Feature",
                properties: { kind },
                geometry: { type: "LineString", coordinates },
            })),
    };
}
