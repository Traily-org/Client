import "maplibre-gl/dist/maplibre-gl.css";

import {
    AttributionControl,
    getVersion,
    Map,
    type Map as MapLibreMap,
    Marker,
    Popup,
    setWorkerUrl,
    type StyleSpecification,
} from "maplibre-gl";
import { useEffect, useRef, useState } from "react";

import { MapLegalNotices } from "./MapLegalNotices";
import { MapModeSwitcher } from "./MapModeSwitcher";
import {
    getMapStyle,
    MIN_ZOOM,
    SHOW_MAPTILER_LEGAL_NOTICES,
    type MapMode,
} from "./style/map-styles";

const TRAILHEAD = {
    name: "Départ du sentier",
    lngLat: [6.1296, 45.8992] as [number, number],
};

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
    setWorkerUrl(
        `https://cdn.jsdelivr.net/npm/maplibre-gl@${getVersion()}/dist/maplibre-gl-worker.mjs`,
    );
    setupDone = true;
}

export function TrailyMap() {
    const containerRef = useRef<HTMLDivElement>(null);
    const mapRef = useRef<MapLibreMap | null>(null);
    const [mode, setMode] = useState<MapMode>("trail");
    const [styleError, setStyleError] = useState<Error | null>(null);
    const [styleLoaded, setStyleLoaded] = useState(false);

    useEffect(() => {
        setupMapLibreForWeb();

        if (!containerRef.current) return;

        const map = new Map({
            container: containerRef.current,
            // Empty placeholder until the MapTiler style arrives (see the
            // mode effect below).
            style: { version: 8, sources: {}, layers: [] },
            center: TRAILHEAD.lngLat,
            zoom: 11,
            minZoom: MIN_ZOOM,
            // Keeps more already-fetched tiles around in memory, so
            // panning/zooming back to a spot you've already visited redraws
            // instantly instead of re-fetching.
            maxTileCacheZoomLevels: 8,
            // No built-in nav (zoom +/- + compass) — this app renders its
            // own map chrome (MapModeSwitcher, bottom-right). The default
            // attribution control is replaced below: by MapLegalNotices when
            // those are enabled, else by a compact one out of the switcher's
            // corner.
            attributionControl: false,
        });
        mapRef.current = map;

        if (!SHOW_MAPTILER_LEGAL_NOTICES) {
            map.addControl(
                new AttributionControl({ compact: true }),
                "bottom-left",
            );
        }

        const popup = new Popup({ offset: 24 }).setText(TRAILHEAD.name);
        new Marker({ color: "#e0733f" })
            .setLngLat(TRAILHEAD.lngLat)
            .setPopup(popup)
            .addTo(map);

        return () => {
            mapRef.current = null;
            map.remove();
        };
    }, []);

    useEffect(() => {
        // Ignore a slower, older fetch resolving after a newer mode switch.
        let cancelled = false;
        getMapStyle(mode).then(
            (style) => {
                if (cancelled) return;
                setStyleError(null);
                setStyleLoaded(true);
                mapRef.current?.setStyle(style as StyleSpecification);
            },
            (error: Error) => {
                if (!cancelled) setStyleError(error);
            },
        );
        return () => {
            cancelled = true;
        };
    }, [mode]);

    // Surface a missing/invalid MapTiler key to the error boundary instead of
    // leaving a blank map, but only before any style has loaded — a failed
    // mode switch just keeps the current style.
    if (styleError && !styleLoaded) throw styleError;

    return (
        <div style={{ position: "relative", display: "flex", flex: 1 }}>
            <div ref={containerRef} style={{ display: "flex", flex: 1 }} />
            {SHOW_MAPTILER_LEGAL_NOTICES && <MapLegalNotices />}
            <MapModeSwitcher mode={mode} onChange={setMode} />
        </div>
    );
}
