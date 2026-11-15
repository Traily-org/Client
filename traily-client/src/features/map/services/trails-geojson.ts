import type { MapTrail } from "../types";

/** Properties of every feature of the trails source, read by its layers. */
export interface TrailFeatureProperties {
    trailId: string;
    /** The trail picked for the hike. */
    highlighted: boolean;
    /** The trail in focus, with its preview open. */
    focused: boolean;
    /** Another trail has the focus: this one fades back. */
    dimmed: boolean;
}

type TrailFeature =
    | {
          type: "Feature";
          properties: TrailFeatureProperties;
          geometry: { type: "LineString"; coordinates: [number, number][] };
      }
    | {
          type: "Feature";
          properties: TrailFeatureProperties;
          geometry: { type: "Point"; coordinates: [number, number] };
      };

export interface TrailFeatureCollection {
    type: "FeatureCollection";
    features: TrailFeature[];
}

/** Drawing order: others first, then the highlighted, then the focused. */
function layer(trailId: string, highlightedId?: string, focusedId?: string) {
    if (trailId === focusedId) return 2;
    return trailId === highlightedId ? 1 : 0;
}

/**
 * One line per route and one point per start, in a single GeoJSON source
 * for both platforms. The highlighted trail, then the focused one, come
 * last, so they are drawn on top of the others.
 */
export function toTrailsGeoJSON(
    trails: MapTrail[],
    highlightedTrailId?: string,
    focusedTrailId?: string,
): TrailFeatureCollection {
    const ordered = [...trails].sort(
        (a, b) =>
            layer(a.id, highlightedTrailId, focusedTrailId) -
            layer(b.id, highlightedTrailId, focusedTrailId),
    );
    const lines: TrailFeature[] = [];
    const starts: TrailFeature[] = [];
    for (const trail of ordered) {
        if (trail.route.length === 0) continue;
        const focused = trail.id === focusedTrailId;
        const properties = {
            trailId: trail.id,
            highlighted: trail.id === highlightedTrailId,
            focused,
            dimmed: focusedTrailId !== undefined && !focused,
        };
        lines.push({
            type: "Feature",
            properties,
            geometry: { type: "LineString", coordinates: trail.route },
        });
        starts.push({
            type: "Feature",
            properties,
            geometry: { type: "Point", coordinates: trail.route[0] },
        });
    }
    // Start points after the lines: they stay above every route.
    return { type: "FeatureCollection", features: [...lines, ...starts] };
}

/** Trail id carried by a touched feature, if it is one of ours. */
export function getTrailId(feature: { properties?: unknown }): string | null {
    const properties = feature.properties;
    if (typeof properties !== "object" || properties === null) return null;
    const trailId = (properties as Record<string, unknown>).trailId;
    return typeof trailId === "string" ? trailId : null;
}
