import "maplibre-gl/dist/maplibre-gl.css";

import {
    addProtocol,
    getVersion,
    Map,
    Marker,
    NavigationControl,
    Popup,
    setWorkerUrl,
    type StyleSpecification,
} from "maplibre-gl";
import { Protocol } from "pmtiles";
import { useEffect, useRef } from "react";

import {
    getTrailyMapStyle,
    MIN_ZOOM,
    PMTILES_URL,
} from "./style/get-traily-map-style";

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
    addProtocol("pmtiles", new Protocol().tile);
    setWorkerUrl(
        `https://cdn.jsdelivr.net/npm/maplibre-gl@${getVersion()}/dist/maplibre-gl-worker.mjs`,
    );
    setupDone = true;
}

export function TrailyMap() {
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        setupMapLibreForWeb();

        if (!containerRef.current) return;

        const map = new Map({
            container: containerRef.current,
            style: getTrailyMapStyle(
                `pmtiles://${getWebPmtilesUrl()}`,
            ) as StyleSpecification,
            center: TRAILHEAD.lngLat,
            zoom: 11,
            minZoom: MIN_ZOOM,
            // Keeps more already-fetched tiles around in memory, so
            // panning/zooming back to a spot you've already visited redraws
            // instantly instead of re-fetching.
            maxTileCacheZoomLevels: 8,
        });
        map.addControl(new NavigationControl(), "top-right");

        const popup = new Popup({ offset: 24 }).setText(TRAILHEAD.name);
        new Marker({ color: "#e0733f" })
            .setLngLat(TRAILHEAD.lngLat)
            .setPopup(popup)
            .addTo(map);

        return () => map.remove();
    }, []);

    return <div ref={containerRef} style={{ display: "flex", flex: 1 }} />;
}
