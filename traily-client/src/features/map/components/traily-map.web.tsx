import "maplibre-gl/dist/maplibre-gl.css";

import {
    Map,
    type Map as MapLibreMap,
    Marker,
    Popup,
    type StyleSpecification,
} from "maplibre-gl";
import { useEffect, useRef, useState } from "react";

import { MAP_MIN_ZOOM } from "@/constants/config";

import { MapLegalNotices } from "./map-legal-notices";
import { setupMapLibreForWeb } from "./setup-maplibre-web";
import { useMapMode } from "../hooks/use-map-mode";
import { getMapStyle, SHOW_MAPTILER_LEGAL_NOTICES } from "../style/map-styles";
import type { TrailyMapProps } from "../types";

const TRAILHEAD = {
    name: "Départ du sentier",
    lngLat: [6.1296, 45.8992] as [number, number],
};

export function TrailyMap({ bottomOffset = 0 }: TrailyMapProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const mapRef = useRef<MapLibreMap | null>(null);
    const mode = useMapMode();
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
            minZoom: MAP_MIN_ZOOM,
            // Keeps more already-fetched tiles around in memory, so
            // panning/zooming back to a spot you've already visited redraws
            // instantly instead of re-fetching.
            maxTileCacheZoomLevels: 8,
            // No built-in nav (zoom +/- + compass) — this app renders its
            // own map chrome (MapControls). The default attribution control
            // is replaced by MapLegalNotices when those are enabled. Without
            // them, the web build (development only, never shipped) shows
            // no attribution: MapLibre's compact one opens expanded over the
            // corner buttons.
            attributionControl: false,
        });
        mapRef.current = map;

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
            {SHOW_MAPTILER_LEGAL_NOTICES && (
                <MapLegalNotices bottomOffset={bottomOffset} />
            )}
        </div>
    );
}
