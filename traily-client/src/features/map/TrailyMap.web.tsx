import "maplibre-gl/dist/maplibre-gl.css";

import {
    addProtocol,
    getVersion,
    Map,
    type Map as MapLibreMap,
    Marker,
    Popup,
    setWorkerUrl,
    type StyleSpecification,
} from "maplibre-gl";
import { PMTiles, Protocol } from "pmtiles";
import { useEffect, useRef, useState } from "react";

import { MapModeSwitcher } from "./MapModeSwitcher";
import {
    getMapStyle,
    MIN_ZOOM,
    type MapMode,
    PMTILES_URL,
} from "./style/map-styles";

const TRAILHEAD = {
    name: "Départ du sentier",
    lngLat: [6.1296, 45.8992] as [number, number],
};

/**
 * `build.protomaps.com` sends no CORS headers, so the browser build reads
 * through a local dev proxy that re-serves the same bytes with them added
 * (`pnpm web:tiles-proxy`; see scripts/pmtiles-dev-proxy.mjs). Native isn't
 * affected — MapLibre Native's HTTP client isn't subject to CORS.
 */
function getWebPmtilesUrl() {
    if (!PMTILES_URL) {
        throw new Error(
            "EXPO_PUBLIC_PM_TILES_URL is not set (see traily-client/.env)",
        );
    }
    const { pathname } = new URL(PMTILES_URL);
    return `${window.location.protocol}//${window.location.hostname}:8082${pathname}`;
}

let setupDone = false;
let protocol: Protocol | null = null;

/**
 * maplibre-gl locates its tile-parsing worker via `import.meta.url`, which
 * Metro doesn't preserve per-module — it resolves to the entry bundle's URL
 * instead, so the worker 404s and no vector layers render (the style still
 * loads and paints the background/markers, since those don't need the
 * worker). Point it at jsDelivr's build of the exact installed version
 * instead, which serves it with CORS enabled.
 */
function setupMapLibreForWeb() {
    if (setupDone) return;
    protocol = new Protocol();
    addProtocol("pmtiles", protocol.tile);
    setWorkerUrl(
        `https://cdn.jsdelivr.net/npm/maplibre-gl@${getVersion()}/dist/maplibre-gl-worker.mjs`,
    );
    setupDone = true;
}

/**
 * The `Protocol` resolves `pmtiles://<url>` sources to a shared `PMTiles`
 * instance keyed by `<url>` (see the `pmtiles` package's `Protocol.tilev4`).
 * Registering it ourselves up front — rather than waiting for the map's own
 * first tile request to create it — means `prefetchSurroundingTiles` can
 * read from (and warm) the exact same instance the map renders from, with no
 * race between the two.
 */
function getSharedPmtiles(url: string): PMTiles {
    if (!protocol) {
        throw new Error("setupMapLibreForWeb() must run before this");
    }
    const existing = protocol.get(url);
    if (existing) return existing;
    const instance = new PMTiles(url);
    protocol.add(instance);
    return instance;
}

// How far past the visible edges to warm tiles, as a fraction of the
// viewport's own width/height on each side.
const PREFETCH_BUFFER_RATIO = 0.75;
// Bounds how large the "already prefetched" set can grow over a long
// session; cheap to just start over once in a while.
const MAX_TRACKED_PREFETCHES = 2000;

function tileForLngLat(lng: number, lat: number, zoom: number) {
    const n = 2 ** zoom;
    const latRad = (lat * Math.PI) / 180;
    return {
        x: Math.floor(((lng + 180) / 360) * n),
        y: Math.floor(
            ((1 - Math.log(Math.tan(latRad) + 1 / Math.cos(latRad)) / Math.PI) /
                2) *
                n,
        ),
    };
}

/**
 * Fetches (and lets `pmtiles` cache) the tiles just outside the current
 * viewport, so panning into them lands on an already-warm cache instead of
 * showing a blank tile while the request is in flight. Also warms `pmtiles`'
 * own header/directory cache for the whole area, which shaves a round trip
 * off every real tile request MapLibre makes next, not just the prefetched
 * ones.
 */
function prefetchSurroundingTiles(
    map: MapLibreMap,
    pmtiles: PMTiles,
    alreadyFetched: Set<string>,
) {
    const zoom = Math.round(map.getZoom());
    const tileCount = 2 ** zoom;
    const canvas = map.getCanvas();
    const padX = canvas.clientWidth * PREFETCH_BUFFER_RATIO;
    const padY = canvas.clientHeight * PREFETCH_BUFFER_RATIO;

    const topLeft = map.unproject([-padX, -padY]);
    const bottomRight = map.unproject([
        canvas.clientWidth + padX,
        canvas.clientHeight + padY,
    ]);
    const start = tileForLngLat(topLeft.lng, topLeft.lat, zoom);
    const end = tileForLngLat(bottomRight.lng, bottomRight.lat, zoom);

    const minX = Math.max(0, Math.min(start.x, end.x));
    const maxX = Math.min(tileCount - 1, Math.max(start.x, end.x));
    const minY = Math.max(0, Math.min(start.y, end.y));
    const maxY = Math.min(tileCount - 1, Math.max(start.y, end.y));

    if (alreadyFetched.size > MAX_TRACKED_PREFETCHES) alreadyFetched.clear();

    for (let x = minX; x <= maxX; x++) {
        for (let y = minY; y <= maxY; y++) {
            const key = `${zoom}/${x}/${y}`;
            if (alreadyFetched.has(key)) continue;
            alreadyFetched.add(key);
            pmtiles.getZxy(zoom, x, y).catch(() => {
                alreadyFetched.delete(key);
            });
        }
    }
}

export function TrailyMap() {
    const containerRef = useRef<HTMLDivElement>(null);
    const mapRef = useRef<MapLibreMap | null>(null);
    const [mode, setMode] = useState<MapMode>("trail");

    useEffect(() => {
        setupMapLibreForWeb();

        if (!containerRef.current) return;

        const pmtilesUrl = getWebPmtilesUrl();
        const pmtiles = getSharedPmtiles(pmtilesUrl);

        const map = new Map({
            container: containerRef.current,
            style: getMapStyle(
                "trail",
                `pmtiles://${pmtilesUrl}`,
            ) as StyleSpecification,
            center: TRAILHEAD.lngLat,
            zoom: 11,
            minZoom: MIN_ZOOM,
            // Keeps more already-fetched tiles around in memory, so
            // panning/zooming back to a spot you've already visited redraws
            // instantly instead of re-fetching.
            maxTileCacheZoomLevels: 8,
            // No built-in nav (zoom +/- + compass) or attribution control —
            // this app renders its own map chrome (MapModeSwitcher). Source
            // attributions still need to live somewhere in the app (a
            // credits/about screen, not on the map itself) to stay compliant
            // with OSM/Protomaps/Esri's terms.
            attributionControl: false,
        });
        mapRef.current = map;

        const popup = new Popup({ offset: 24 }).setText(TRAILHEAD.name);
        new Marker({ color: "#e0733f" })
            .setLngLat(TRAILHEAD.lngLat)
            .setPopup(popup)
            .addTo(map);

        const prefetchedTileKeys = new Set<string>();
        const prefetch = () =>
            prefetchSurroundingTiles(map, pmtiles, prefetchedTileKeys);
        map.once("idle", prefetch);
        map.on("moveend", prefetch);

        return () => {
            mapRef.current = null;
            map.remove();
        };
    }, []);

    // Skip the very first run: the init effect above already applies the
    // "trail" style when it constructs the map.
    const isFirstModeRender = useRef(true);
    useEffect(() => {
        if (isFirstModeRender.current) {
            isFirstModeRender.current = false;
            return;
        }
        mapRef.current?.setStyle(
            getMapStyle(
                mode,
                `pmtiles://${getWebPmtilesUrl()}`,
            ) as StyleSpecification,
        );
    }, [mode]);

    return (
        <div style={{ position: "relative", display: "flex", flex: 1 }}>
            <div ref={containerRef} style={{ display: "flex", flex: 1 }} />
            <MapModeSwitcher mode={mode} onChange={setMode} />
        </div>
    );
}
