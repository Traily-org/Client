import trailyStyle from "./traily-style.json";

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

/**
 * Returns a plain style spec object with the given pmtiles source URL
 * (already prefixed with `pmtiles://`) wired in. Not typed against either
 * `maplibre-gl`'s or `@maplibre/maplibre-react-native`'s `StyleSpecification`
 * (the two packages pin different, nominally incompatible versions of
 * `@maplibre/maplibre-gl-style-spec`) — cast to the right one at each
 * platform-specific call site.
 */
export function getTrailyMapStyle(pmtilesSourceUrl: string) {
    return {
        ...trailyStyle,
        sources: {
            ...trailyStyle.sources,
            protomaps: {
                ...trailyStyle.sources.protomaps,
                url: pmtilesSourceUrl,
            },
        },
    };
}
