import {
    Camera,
    Map,
    type MapRef,
    Marker,
    type StyleSpecification,
} from "@maplibre/maplibre-react-native";
import { useEffect, useRef, useState } from "react";
import { StyleSheet, Text, View } from "react-native";

import { MapLegalNotices } from "./map-legal-notices";
import { PhotoPinMarker, ROUTE_MAP_PADDING } from "./photo-pin-marker";
import { RouteEndMarker, RouteStartMarker } from "./route-end-marker";
import { useMapMode } from "../hooks/use-map-mode";
import { getBounds } from "../services/route-bounds";
import { getMapStyle, SHOW_MAPTILER_LEGAL_NOTICES } from "../style/map-styles";
import type { TrailRouteMapProps } from "../types";

/**
 * Map of a route, framed on the whole line, with photo pins along it. It
 * zooms in and pans, but never zooms out past that framing, nor pans the
 * route out of sight. No rotation or tilt.
 */
export function TrailRouteMap({
    route,
    pins = [],
    onPressPin,
}: TrailRouteMapProps) {
    const mode = useMapMode();
    const [mapStyle, setMapStyle] = useState<StyleSpecification | null>(null);
    const [failed, setFailed] = useState(false);
    const mapRef = useRef<MapRef>(null);
    // Zoom of the initial framing, once the map has laid it out.
    const [fitZoom, setFitZoom] = useState<number | undefined>(undefined);

    useEffect(() => {
        let cancelled = false;
        getMapStyle(mode, route).then(
            (style) => {
                if (cancelled) return;
                setFailed(false);
                setMapStyle(style as StyleSpecification);
            },
            () => {
                if (!cancelled) setFailed(true);
            },
        );
        return () => {
            cancelled = true;
        };
    }, [mode, route]);

    if (!mapStyle) {
        return (
            <View style={[styles.container, styles.placeholder]}>
                {failed && <Text style={styles.error}>Carte indisponible</Text>}
            </View>
        );
    }

    const bounds = getBounds([...route, ...pins.map((pin) => pin.lngLat)]);

    return (
        <View style={styles.container}>
            <Map
                style={styles.map}
                mapStyle={mapStyle}
                attribution={!SHOW_MAPTILER_LEGAL_NOTICES}
                attributionPosition={{ bottom: 8, left: 8 }}
                logo={false}
                compass={false}
                touchRotate={false}
                touchPitch={false}
                ref={mapRef}
                onDidFinishLoadingMap={() => {
                    void mapRef.current?.getZoom().then(setFitZoom);
                }}
            >
                <Camera
                    initialViewState={{ bounds, padding: ROUTE_MAP_PADDING }}
                    minZoom={fitZoom}
                    maxBounds={bounds}
                />
                {/* Route ends last, so they stay above the pins. */}
                {pins.map((pin) => (
                    <Marker key={pin.id} lngLat={pin.lngLat} anchor="bottom">
                        <PhotoPinMarker
                            photoUrl={pin.photoUrl}
                            label={pin.label}
                            onPress={
                                onPressPin
                                    ? () => onPressPin(pin.id)
                                    : undefined
                            }
                        />
                    </Marker>
                ))}
                <Marker lngLat={route[0]} anchor="center">
                    <RouteStartMarker />
                </Marker>
                <Marker lngLat={route[route.length - 1]} anchor="center">
                    <RouteEndMarker />
                </Marker>
            </Map>
            {SHOW_MAPTILER_LEGAL_NOTICES && (
                <MapLegalNotices safeArea={false} />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    map: { flex: 1 },
    placeholder: {
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#E9E7E0",
    },
    error: { fontSize: 14, color: "rgba(30, 30, 47, 0.55)" },
});
