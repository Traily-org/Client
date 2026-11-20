/**
 * MapTiler API key (free tier: https://cloud.maptiler.com/account/keys/).
 * Restrict it to the app's origins/bundle IDs in the MapTiler dashboard —
 * it ships in the client bundle like any EXPO_PUBLIC_ variable.
 */
export const MAPTILER_KEY = process.env.EXPO_PUBLIC_MAPTILER_KEY;

/**
 * Shows MapTiler's legal notices on the map: their logo (mandatory on the
 * free plan) and an always-visible, readable text attribution (terms §6.1,
 * §6.7) instead of MapLibre's collapsible one. On unless explicitly set to
 * "false" — only do that with a paid plan / written MapTiler agreement.
 */
export const SHOW_MAPTILER_LEGAL_NOTICES =
    process.env.EXPO_PUBLIC_MAPTILER_LEGAL_NOTICES !== "false";

export const MAPTILER_HOME_URL = "https://www.maptiler.com";

/** Text credits required on every map, with the links MapTiler asks for. */
export const MAP_ATTRIBUTIONS = [
    { label: "© MapTiler", url: "https://www.maptiler.com/copyright/" },
    {
        label: "© OpenStreetMap contributors",
        url: "https://www.openstreetmap.org/copyright",
    },
] as const;

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

/** `[longitude, latitude]` points of a route line, start first. */
export type RouteLine = [number, number][];

/** Color of route lines, and of the markers at their ends. */
export const ROUTE_COLOR = "#d1263f";

// Brighter red on satellite imagery, where the darker one gets lost.
const ROUTE_COLORS: Record<MapMode, string> = {
    trail: ROUTE_COLOR,
    satellite: "#ff3b30",
    topo: ROUTE_COLOR,
};

function getRouteLayers(mode: MapMode, color = ROUTE_COLORS[mode]) {
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
                    5,
                    18,
                    10,
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
                "line-color": color,
                "line-width": [
                    "interpolate",
                    ["linear"],
                    ["zoom"],
                    10,
                    3,
                    18,
                    6,
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
 * style, with `route` appended on top as a GeoJSON source and its line
 * layers when given, in `routeColor` (the mode's red by default). Fetched
 * (rather than handing MapLibre the style URL) so the route can be part of
 * the style itself on both platforms. Not typed against either
 * `maplibre-gl`'s or `@maplibre/maplibre-react-native`'s
 * `StyleSpecification` (the two packages pin different, nominally
 * incompatible versions of `@maplibre/maplibre-gl-style-spec`) — cast to the
 * right one at each platform-specific call site.
 */
export async function getMapStyle(
    mode: MapMode,
    route?: RouteLine,
    routeColor?: string,
) {
    const style = await fetchMapTilerStyle(mode);
    // A fresh object each time: the cached one is shared by every map.
    if (!route) {
        return {
            ...style,
            sources: { ...style.sources },
            layers: [...style.layers],
        };
    }
    return {
        ...style,
        sources: {
            ...style.sources,
            route: {
                type: "geojson",
                data: {
                    type: "Feature",
                    properties: {},
                    geometry: { type: "LineString", coordinates: route },
                },
            },
        },
        layers: [...style.layers, ...getRouteLayers(mode, routeColor)],
    };
}

/** GeoJSON source of the trails drawn on the home map. */
export const TRAILS_SOURCE_ID = "trails";

/** Zoomed out further, only the start of each trail shows. */
export const TRAIL_ROUTE_MIN_ZOOM = 10;
/** Zoomed out further, the trails are hidden: too many dots to read. */
const TRAIL_START_MIN_ZOOM = 7;

/**
 * Layer of the trails or hike source, in the style spec format both
 * platforms take.
 * Loosely typed for the same reason as `getMapStyle`: cast at the call site.
 */
export interface TrailLayer {
    id: string;
    type: "line" | "circle";
    source: string;
    minzoom: number;
    filter: unknown[];
    layout?: Record<string, unknown>;
    paint: Record<string, unknown>;
}

/** The highlighted or focused trail's line is wider. */
function byEmphasis(emphasized: unknown, other: unknown) {
    return [
        "case",
        ["any", ["get", "focused"], ["get", "highlighted"]],
        emphasized,
        other,
    ];
}

/** Opacity of a trail: faded back while another one has the focus. */
function byFocus(focused: number, dimmed: number, other: number) {
    return [
        "case",
        ["get", "focused"],
        focused,
        ["get", "dimmed"],
        dimmed,
        other,
    ];
}

/**
 * Layers drawing the trails source: each route as a line with a white
 * casing, like the trail sheet's map, and its start as a dot, in the
 * trail's own color (its difficulty) or the mode's red. Zoomed out,
 * the dot is filled in the route color; once the routes show, it becomes a
 * ring, as on the trail sketches. While a trail has the focus, it is drawn
 * wider and the others fade back.
 */
export function getTrailLayers(mode: MapMode): TrailLayer[] {
    const color = ["coalesce", ["get", "color"], ROUTE_COLORS[mode]];
    const lines = ["==", ["geometry-type"], "LineString"];
    const layout = { "line-join": "round", "line-cap": "round" };
    return [
        {
            id: "trails-casing",
            type: "line",
            source: TRAILS_SOURCE_ID,
            minzoom: TRAIL_ROUTE_MIN_ZOOM,
            filter: lines,
            layout,
            paint: {
                "line-color": "#ffffff",
                "line-width": [
                    "interpolate",
                    ["linear"],
                    ["zoom"],
                    TRAIL_ROUTE_MIN_ZOOM,
                    byEmphasis(7, 4),
                    16,
                    byEmphasis(12, 8),
                ],
                "line-opacity": byFocus(0.95, 0.3, 0.85),
            },
        },
        {
            id: "trails-line",
            type: "line",
            source: TRAILS_SOURCE_ID,
            minzoom: TRAIL_ROUTE_MIN_ZOOM,
            filter: lines,
            layout,
            paint: {
                "line-color": color,
                "line-width": [
                    "interpolate",
                    ["linear"],
                    ["zoom"],
                    TRAIL_ROUTE_MIN_ZOOM,
                    byEmphasis(4, 2),
                    16,
                    byEmphasis(8, 5),
                ],
                "line-opacity": byFocus(1, 0.35, 0.85),
            },
        },
        {
            id: "trails-start",
            type: "circle",
            source: TRAILS_SOURCE_ID,
            minzoom: TRAIL_START_MIN_ZOOM,
            filter: ["==", ["geometry-type"], "Point"],
            paint: {
                "circle-radius": [
                    "interpolate",
                    ["linear"],
                    ["zoom"],
                    TRAIL_START_MIN_ZOOM,
                    3.5,
                    TRAIL_ROUTE_MIN_ZOOM,
                    5,
                    16,
                    6,
                ],
                "circle-color": [
                    "step",
                    ["zoom"],
                    color,
                    TRAIL_ROUTE_MIN_ZOOM,
                    "#ffffff",
                ],
                "circle-stroke-color": [
                    "step",
                    ["zoom"],
                    "#ffffff",
                    TRAIL_ROUTE_MIN_ZOOM,
                    color,
                ],
                "circle-stroke-width": [
                    "step",
                    ["zoom"],
                    2,
                    TRAIL_ROUTE_MIN_ZOOM,
                    3,
                ],
                "circle-opacity": byFocus(1, 0.4, 1),
                "circle-stroke-opacity": byFocus(1, 0.4, 1),
            },
        },
    ];
}

/** Layers a touch on the map can pick a trail from. */
export const TRAIL_TOUCH_LAYER_IDS = ["trails-line", "trails-start"];

/** GeoJSON source of the hike in progress: the part already walked. */
export const HIKE_SOURCE_ID = "hike";

/** Part of the route already walked: faded, whatever the trail's color. */
const WALKED_COLOR = "#9d9daa";
/** The walker's own track: apart from every difficulty color. */
const TRACK_COLOR = "#2f6fe0";

/**
 * Layers drawing the hike source above the trails: the part of the route
 * already walked, as wide as the picked trail's line so it covers it
 * exactly, over the same white casing; then the walker's own track, a thin
 * line with a white edge, detours included.
 */
export function getHikeLayers(): TrailLayer[] {
    const layout = { "line-join": "round", "line-cap": "round" };
    const track = ["==", ["get", "kind"], "track"];
    return [
        {
            id: "hike-walked",
            type: "line",
            source: HIKE_SOURCE_ID,
            minzoom: TRAIL_ROUTE_MIN_ZOOM,
            filter: ["==", ["get", "kind"], "walked"],
            layout,
            paint: {
                "line-color": WALKED_COLOR,
                "line-width": [
                    "interpolate",
                    ["linear"],
                    ["zoom"],
                    TRAIL_ROUTE_MIN_ZOOM,
                    4,
                    16,
                    8,
                ],
            },
        },
        {
            id: "hike-track-casing",
            type: "line",
            source: HIKE_SOURCE_ID,
            minzoom: TRAIL_ROUTE_MIN_ZOOM,
            filter: track,
            layout,
            paint: {
                "line-color": "#ffffff",
                "line-width": [
                    "interpolate",
                    ["linear"],
                    ["zoom"],
                    TRAIL_ROUTE_MIN_ZOOM,
                    3,
                    16,
                    6,
                ],
                "line-opacity": 0.9,
            },
        },
        {
            id: "hike-track",
            type: "line",
            source: HIKE_SOURCE_ID,
            minzoom: TRAIL_ROUTE_MIN_ZOOM,
            filter: track,
            layout,
            paint: {
                "line-color": TRACK_COLOR,
                "line-width": [
                    "interpolate",
                    ["linear"],
                    ["zoom"],
                    TRAIL_ROUTE_MIN_ZOOM,
                    1.5,
                    16,
                    3,
                ],
            },
        },
    ];
}

/**
 * Data-source attributions for the credits screen. The map also shows
 * them on-screen (see MapLegalNotices), as MapTiler's terms require.
 */
export function getAllAttributions(): string[] {
    return MAP_ATTRIBUTIONS.map((attribution) => attribution.label);
}
