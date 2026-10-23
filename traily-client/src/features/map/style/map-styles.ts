/**
 * MapTiler API key (free tier: https://cloud.maptiler.com/account/keys/).
 * Restrict it to the app's origins/bundle IDs in the MapTiler dashboard —
 * it ships in the client bundle like any EXPO_PUBLIC_ variable.
 */
export const MAPTILER_KEY = process.env.EXPO_PUBLIC_MAPTILER_KEY;

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
 * MapTiler map IDs backing each mode. `outdoor-v2` already draws hiking
 * paths, contour lines and hillshade; `topo-v2` leans harder on relief;
 * `hybrid` is satellite imagery with labels and roads on top.
 */
const MAPTILER_MAP_IDS: Record<MapMode, string> = {
    trail: "outdoor-v2",
    satellite: "hybrid",
    topo: "topo-v2",
};

/**
 * Loosely typed on purpose: not typed against either package's real
 * `StyleSpecification` for the same reason as `getMapStyle` below.
 */
type StyleJSON = {
    version: number;
    sources: Record<string, unknown>;
    layers: unknown[];
    [key: string]: unknown;
};

/**
 * Sample hike near the trailhead, standing in for real route data until a
 * route data model exists. Appended to each MapTiler style as a `route`
 * GeoJSON source so the rendering path (casing + colored line, per-mode
 * styling) is already in place when real routes arrive.
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

// Brighter red on satellite imagery, where the darker one gets lost.
const ROUTE_COLORS: Record<MapMode, string> = {
    trail: "#d1263f",
    satellite: "#ff3b30",
    topo: "#d1263f",
};

function getRouteLayers(mode: MapMode) {
    const layout = { "line-join": "round", "line-cap": "round" };
    return [
        {
            id: "route-casing",
            type: "line",
            source: "route",
            layout,
            paint: {
                "line-color": "#ffffff",
                "line-width": [
                    "interpolate",
                    ["linear"],
                    ["zoom"],
                    10,
                    3,
                    18,
                    8,
                ],
                "line-opacity": 0.9,
            },
        },
        {
            id: "route-line",
            type: "line",
            source: "route",
            layout,
            paint: {
                "line-color": ROUTE_COLORS[mode],
                "line-width": [
                    "interpolate",
                    ["linear"],
                    ["zoom"],
                    10,
                    1.5,
                    18,
                    5,
                ],
            },
        },
    ];
}

const styleCache = new Map<MapMode, Promise<StyleJSON>>();

function fetchMapTilerStyle(mode: MapMode): Promise<StyleJSON> {
    const cached = styleCache.get(mode);
    if (cached) return cached;

    if (!MAPTILER_KEY) {
        throw new Error(
            "EXPO_PUBLIC_MAPTILER_KEY is not set (see traily-client/.env)",
        );
    }
    const url = `https://api.maptiler.com/maps/${MAPTILER_MAP_IDS[mode]}/style.json?key=${MAPTILER_KEY}`;
    const request = fetch(url).then(async (response) => {
        if (!response.ok) {
            throw new Error(
                `MapTiler style "${MAPTILER_MAP_IDS[mode]}" failed to load (HTTP ${response.status})`,
            );
        }
        return (await response.json()) as StyleJSON;
    });
    // Don't cache a failure — let the next mode switch retry.
    request.catch(() => styleCache.delete(mode));
    styleCache.set(mode, request);
    return request;
}

/**
 * Resolves to a plain style spec object for the given mode: the MapTiler
 * style with the sample route source and layers appended on top. Fetched
 * (rather than handing MapLibre the style URL) so the route can be part of
 * the style itself on both platforms. Not typed against either
 * `maplibre-gl`'s or `@maplibre/maplibre-react-native`'s
 * `StyleSpecification` (the two packages pin different, nominally
 * incompatible versions of `@maplibre/maplibre-gl-style-spec`) — cast to the
 * right one at each platform-specific call site.
 */
export async function getMapStyle(mode: MapMode) {
    const style = await fetchMapTilerStyle(mode);
    return {
        ...style,
        sources: {
            ...style.sources,
            route: { type: "geojson", data: SAMPLE_ROUTE_GEOJSON },
        },
        layers: [...style.layers, ...getRouteLayers(mode)],
    };
}

/**
 * Data-source attributions for the credits screen. The map also shows
 * MapTiler's own attribution on-screen (required by their terms).
 */
export function getAllAttributions(): string[] {
    return ["© MapTiler", "© OpenStreetMap contributors"];
}
