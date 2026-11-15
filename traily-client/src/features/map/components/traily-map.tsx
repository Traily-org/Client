import {
    Camera,
    type CameraRef,
    GeoJSONSource,
    Layer,
    type LayerProps,
    Map,
    type MapRef,
    Marker,
    OfflineManager,
    type StyleSpecification,
} from "@maplibre/maplibre-react-native";
import * as Haptics from "expo-haptics";
import { useEffect, useRef, useState } from "react";
import { StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { MAP_MIN_ZOOM } from "@/constants/config";
import { getBounds } from "@/utils/bounds";

import { MapLegalNotices } from "./map-legal-notices";
import { PhotoPinMarker } from "./photo-pin-marker";
import { RouteEndMarker } from "./route-end-marker";
import {
    getTrailFocusPadding,
    TRAIL_FOCUS_DURATION,
    TRAIL_HIT_RADIUS,
} from "./trail-focus-camera";
import { useMapMode } from "../hooks/use-map-mode";
import { getTrailId, toTrailsGeoJSON } from "../services/trails-geojson";
import {
    getMapStyle,
    getTrailLayers,
    SHOW_MAPTILER_LEGAL_NOTICES,
    TRAIL_TOUCH_LAYER_IDS,
    TRAILS_SOURCE_ID,
} from "../style/map-styles";
import type { MapTrail, PhotoPin, TrailyMapProps } from "../types";

// Shared defaults, so the data stays the same object between renders.
const NO_TRAILS: MapTrail[] = [];
const NO_PINS: PhotoPin[] = [];

/** Where the map opens: Annecy, until it follows the user's position. */
const INITIAL_VIEW = {
    center: [6.1296, 45.8992] as [number, number],
    zoom: 11,
};

// MapLibre Native persists every tile it renders to an on-disk ambient
// cache automatically — no wiring needed for that part. Its default 50MB
// limit fills up fast with vector tiles though, evicting tiles from areas
// the user just panned away from, so re-visiting them or zooming back out
// re-fetches over the network instead of hitting disk. Raise the ceiling
// once per app run so more of a hike's surrounding area stays cached.
const AMBIENT_CACHE_SIZE_BYTES = 200 * 1024 * 1024;
let ambientCacheConfigured = false;

export function TrailyMap({
    bottomOffset = 0,
    trails = NO_TRAILS,
    highlightedTrailId,
    focusedTrailId,
    pins = NO_PINS,
    onPressTrail,
    onPressPin,
    onPressMap,
    onViewportChange,
}: TrailyMapProps) {
    const insets = useSafeAreaInsets();
    const mode = useMapMode();
    const mapRef = useRef<MapRef>(null);
    const cameraRef = useRef<CameraRef>(null);
    const [mapStyle, setMapStyle] = useState<StyleSpecification | null>(null);
    const [styleError, setStyleError] = useState<Error | null>(null);

    useEffect(() => {
        if (ambientCacheConfigured) return;
        ambientCacheConfigured = true;
        void OfflineManager.setMaximumAmbientCacheSize(
            AMBIENT_CACHE_SIZE_BYTES,
        );
    }, []);

    useEffect(() => {
        // Ignore a slower, older fetch resolving after a newer mode switch.
        let cancelled = false;
        getMapStyle(mode).then(
            (style) => {
                if (cancelled) return;
                setStyleError(null);
                setMapStyle(style as StyleSpecification);
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
    // rendering a blank map, but only before any style has loaded — a failed
    // mode switch just keeps the current style.
    if (styleError && !mapStyle) throw styleError;
    if (!mapStyle) return <View style={styles.container} />;

    const focusedTrail = trails.find((trail) => trail.id === focusedTrailId);

    // Frames the trail between the controls, then reports the press.
    function pressTrail(trailId: string, haptic: Haptics.ImpactFeedbackStyle) {
        const trail = trails.find((candidate) => candidate.id === trailId);
        if (!trail) return;
        void Haptics.impactAsync(haptic);
        cameraRef.current?.fitBounds(getBounds(trail.route), {
            padding: getTrailFocusPadding(insets, bottomOffset),
            duration: TRAIL_FOCUS_DURATION,
            easing: "ease",
        });
        onPressTrail?.(trail.id);
    }

    // A finger is wider than a line: look for a trail around the press.
    async function handleLongPress([x, y]: [number, number]) {
        const r = TRAIL_HIT_RADIUS;
        const features = await mapRef.current?.queryRenderedFeatures(
            [
                [x - r, y - r],
                [x + r, y + r],
            ],
            { layers: TRAIL_TOUCH_LAYER_IDS },
        );
        const trailId = features?.map(getTrailId).find((id) => id !== null);
        if (trailId) pressTrail(trailId, Haptics.ImpactFeedbackStyle.Medium);
    }

    return (
        <View style={styles.container}>
            {/* No compass or MapLibre logo — this app renders its own map
                chrome (MapControls). MapLibre's "i"
                attribution button is replaced by MapLegalNotices when those
                are enabled. */}
            <Map
                ref={mapRef}
                style={styles.map}
                mapStyle={mapStyle}
                attribution={!SHOW_MAPTILER_LEGAL_NOTICES}
                attributionPosition={{
                    bottom: insets.bottom + bottomOffset + 8,
                    left: 8,
                }}
                logo={false}
                compass={false}
                onDidFinishLoadingMap={() => {
                    void mapRef.current
                        ?.getViewState()
                        .then(({ bounds, zoom }) =>
                            onViewportChange?.({ bounds, zoom }),
                        );
                }}
                onRegionDidChange={({ nativeEvent: { bounds, zoom } }) =>
                    onViewportChange?.({ bounds, zoom })
                }
                // A touch on a trail stops at its source (below).
                onPress={() => onPressMap?.()}
                onLongPress={(event) =>
                    void handleLongPress(event.nativeEvent.point)
                }
            >
                <Camera
                    ref={cameraRef}
                    initialViewState={INITIAL_VIEW}
                    minZoom={MAP_MIN_ZOOM}
                />
                <GeoJSONSource
                    id={TRAILS_SOURCE_ID}
                    data={toTrailsGeoJSON(
                        trails,
                        highlightedTrailId,
                        focusedTrailId,
                    )}
                    onPress={(event) => {
                        const feature = event.nativeEvent.features[0];
                        const trailId = feature ? getTrailId(feature) : null;
                        if (!trailId) return;
                        // The map itself has nothing to do with this touch.
                        event.stopPropagation();
                        pressTrail(trailId, Haptics.ImpactFeedbackStyle.Light);
                    }}
                >
                    {getTrailLayers(mode).map((layer) => (
                        <Layer key={layer.id} {...(layer as LayerProps)} />
                    ))}
                </GeoJSONSource>
                {/* As on the trail sheet's map: photo pins along the focused
                    trail, its end above them. */}
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
                {focusedTrail && focusedTrail.route.length > 0 && (
                    <Marker
                        lngLat={
                            focusedTrail.route[focusedTrail.route.length - 1]
                        }
                        anchor="center"
                    >
                        <RouteEndMarker color={focusedTrail.color} />
                    </Marker>
                )}
            </Map>
            {SHOW_MAPTILER_LEGAL_NOTICES && (
                <MapLegalNotices bottomOffset={bottomOffset} />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    map: { flex: 1 },
});
