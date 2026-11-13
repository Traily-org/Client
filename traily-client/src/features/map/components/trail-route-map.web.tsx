import "maplibre-gl/dist/maplibre-gl.css";

import {
    Map,
    type Map as MapLibreMap,
    Marker,
    type PositionAnchor,
    type StyleSpecification,
} from "maplibre-gl";
import { type ReactNode, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { StyleSheet, Text, View } from "react-native";

import { MapLegalNotices } from "./map-legal-notices";
import { PhotoPinMarker, ROUTE_MAP_PADDING } from "./photo-pin-marker";
import { RouteEndMarker, RouteStartMarker } from "./route-end-marker";
import { setupMapLibreForWeb } from "./setup-maplibre-web";
import { useMapMode } from "../hooks/use-map-mode";
import { getBounds } from "../services/route-bounds";
import { getMapStyle, SHOW_MAPTILER_LEGAL_NOTICES } from "../style/map-styles";
import type { TrailRouteMapProps } from "../types";

/** A maplibre-gl marker element and the React content portaled into it. */
interface MarkerSlot {
    key: string;
    element: HTMLElement;
    content: ReactNode;
}

/**
 * Still map of a route, framed on the whole line, with photo pins along it.
 * Gestures are off: it sits inside a scrolling sheet.
 */
export function TrailRouteMap({ route, pins = [] }: TrailRouteMapProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const mapRef = useRef<MapLibreMap | null>(null);
    const mode = useMapMode();
    const [failed, setFailed] = useState(false);
    const [slots, setSlots] = useState<MarkerSlot[]>([]);

    useEffect(() => {
        setupMapLibreForWeb();
        if (!containerRef.current) return;

        const map = new Map({
            container: containerRef.current,
            style: { version: 8, sources: {}, layers: [] },
            bounds: getBounds([...route, ...pins.map((pin) => pin.lngLat)]),
            fitBoundsOptions: { padding: ROUTE_MAP_PADDING },
            interactive: false,
            attributionControl: false,
        });
        mapRef.current = map;

        const items: {
            key: string;
            lngLat: [number, number];
            anchor: PositionAnchor;
            content: ReactNode;
        }[] = [
            ...pins.map((pin) => ({
                key: pin.id,
                lngLat: pin.lngLat,
                anchor: "bottom" as const,
                content: (
                    <PhotoPinMarker photoUrl={pin.photoUrl} label={pin.label} />
                ),
            })),
            {
                key: "start",
                lngLat: route[0],
                anchor: "center",
                content: <RouteStartMarker />,
            },
            {
                key: "end",
                lngLat: route[route.length - 1],
                anchor: "center",
                content: <RouteEndMarker />,
            },
        ];
        // Later markers are drawn on top: the route ends stay above the pins.
        const markers = items.map((item) => {
            const element = document.createElement("div");
            new Marker({ element, anchor: item.anchor })
                .setLngLat(item.lngLat)
                .addTo(map);
            return { key: item.key, element, content: item.content };
        });
        // The marker elements only exist once maplibre-gl has created them.
        setSlots(markers);

        return () => {
            mapRef.current = null;
            setSlots([]);
            map.remove();
        };
    }, [route, pins]);

    useEffect(() => {
        let cancelled = false;
        getMapStyle(mode, route).then(
            (style) => {
                if (cancelled) return;
                setFailed(false);
                mapRef.current?.setStyle(style as StyleSpecification);
            },
            () => {
                if (!cancelled) setFailed(true);
            },
        );
        return () => {
            cancelled = true;
        };
    }, [mode, route]);

    return (
        <View style={styles.container}>
            <div ref={containerRef} style={{ display: "flex", flex: 1 }} />
            {slots.map((slot) =>
                createPortal(slot.content, slot.element, slot.key),
            )}
            {failed && (
                <View style={[StyleSheet.absoluteFill, styles.placeholder]}>
                    <Text style={styles.error}>Carte indisponible</Text>
                </View>
            )}
            {SHOW_MAPTILER_LEGAL_NOTICES && (
                <MapLegalNotices safeArea={false} />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#E9E7E0" },
    placeholder: { alignItems: "center", justifyContent: "center" },
    error: { fontSize: 14, color: "rgba(30, 30, 47, 0.55)" },
});
