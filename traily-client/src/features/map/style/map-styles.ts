import trailyStyle from "./traily-style.json";
import satelliteStyle from "./satellite-style.json";
import topoStyle from "./topo-style.json";

/**
 * Daily Protomaps planet build (free, self-hostable) read via HTTP range
 * requests — no tile server needed. See README for how to pin/extract a
 * smaller region instead of the full planet file.
 *
 * Only used directly on native: `build.protomaps.com` doesn't send CORS
 * headers, so the browser build routes through the local dev proxy instead
 * (see TrailyMap.web.tsx and scripts/pmtiles-dev-proxy.mjs).
 */
export const PMTILES_URL = process.env.EXPO_PUBLIC_PM_TILES_URL;

/**
 * Keeps the map from zooming out to a near-global view, where most tiles
 * aren't cached yet and are visibly blank while they load. Tune to taste —
 * this only needs to cover the area the app actually cares about. Note zoom
 * 0-2 all look like "the whole world", so a low value here can look like it
 * isn't doing anything even though it's being enforced — push it up (5+)
 * once you want the loosest allowed view to feel like a real limit.
 *
 * No MAX_ZOOM: zooming in has no client-side cap (MapLibre's own default,
 * 22, applies). Past the source data's own max zoom the deepest available
 * tile is just scaled up ("overzoom") — normal MapLibre behavior, not a bug.
 */
export const MIN_ZOOM = 12;

export type MapMode = "trail" | "satellite" | "topo";

/**
 * Loosely typed on purpose: each style JSON's `layers` array otherwise
 * infers its own incompatible literal-union type, since layer objects don't
 * share a common shape across layer types. Not typed against either
 * package's real `StyleSpecification` for the same reason as `getMapStyle`
 * below.
 */
type StyleJSON = {
    version: number;
    name: string;
    glyphs: string;
    sprite: string;
    sources: Record<string, { type: string; [key: string]: unknown }>;
    layers: unknown[];
};

const STYLES: Record<MapMode, StyleJSON> = {
    trail: trailyStyle,
    satellite: satelliteStyle,
    topo: topoStyle,
};

/**
 * Sample hike near the trailhead, standing in for real route data until a
 * route data model exists. Rendered via each style's `route` GeoJSON source
 * so the rendering path (casing + colored line, per-mode styling) is already
 * in place when real routes arrive.
 */
const SAMPLE_ROUTE_GEOJSON = {
    type: "Feature",
    properties: {},
    geometry: {
        type: "LineString",
        coordinates: [
            [6.1296, 45.8992],
            [6.1324, 45.9015],
            [6.1355, 45.9042],
            [6.1381, 45.9071],
            [6.1417, 45.9089],
        ],
    },
} as const;

/**
 * Returns a plain style spec object for the given mode with the pmtiles
 * source URL (already prefixed with `pmtiles://`) and the sample route
 * wired in. Not typed against either `maplibre-gl`'s or
 * `@maplibre/maplibre-react-native`'s `StyleSpecification` (the two packages
 * pin different, nominally incompatible versions of
 * `@maplibre/maplibre-gl-style-spec`) — cast to the right one at each
 * platform-specific call site.
 */
export function getMapStyle(mode: MapMode, pmtilesSourceUrl: string) {
    const style = STYLES[mode];
    return {
        ...style,
        sources: {
            ...style.sources,
            protomaps: {
                ...style.sources.protomaps,
                url: pmtilesSourceUrl,
            },
            route: {
                ...style.sources.route,
                data: SAMPLE_ROUTE_GEOJSON,
            },
        },
    };
}

/**
 * Every unique data-source attribution across all map modes, in source
 * order — single source of truth for the credits screen, since the map
 * itself has no on-screen attribution control (see TrailyMap.tsx/.web.tsx).
 */
export function getAllAttributions(): string[] {
    const attributions = new Set<string>();
    for (const style of Object.values(STYLES)) {
        for (const source of Object.values(style.sources)) {
            if (typeof source.attribution === "string") {
                attributions.add(source.attribution);
            }
        }
    }
    return [...attributions];
}
