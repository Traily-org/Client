import {
    Camera,
    Map,
    Marker,
    OfflineManager,
    type StyleSpecification,
} from "@maplibre/maplibre-react-native";
import { useEffect, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { MapModeSwitcher } from "./MapModeSwitcher";
import { getMapStyle, MIN_ZOOM, type MapMode } from "./style/map-styles";

const TRAILHEAD = {
    name: "Départ du sentier",
    lngLat: [6.1296, 45.8992] as [number, number],
};

// MapLibre Native persists every tile it renders to an on-disk ambient
// cache automatically — no wiring needed for that part. Its default 50MB
// limit fills up fast with vector tiles though, evicting tiles from areas
// the user just panned away from, so re-visiting them or zooming back out
// re-fetches over the network instead of hitting disk. Raise the ceiling
// once per app run so more of a hike's surrounding area stays cached.
const AMBIENT_CACHE_SIZE_BYTES = 200 * 1024 * 1024;
let ambientCacheConfigured = false;

export function TrailyMap() {
    const [selected, setSelected] = useState(false);
    const [mode, setMode] = useState<MapMode>("trail");
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

    return (
        <View style={styles.container}>
            {/* No compass or MapLibre logo — this app renders its own map
                chrome (MapModeSwitcher, bottom-right). The attribution stays
                on the map, bottom-left (where the logo would sit), as
                MapTiler's terms require. */}
            <Map
                style={styles.map}
                mapStyle={mapStyle}
                attributionPosition={{ bottom: 8, left: 8 }}
                logo={false}
                compass={false}
            >
                <Camera
                    initialViewState={{ center: TRAILHEAD.lngLat, zoom: 11 }}
                    minZoom={MIN_ZOOM}
                />
                <Marker lngLat={TRAILHEAD.lngLat} anchor="bottom">
                    <Pressable onPress={() => setSelected((prev) => !prev)}>
                        <View style={styles.pin} />
                        {selected && (
                            <View style={styles.popup}>
                                <Text style={styles.popupTitle}>
                                    {TRAILHEAD.name}
                                </Text>
                            </View>
                        )}
                    </Pressable>
                </Marker>
            </Map>
            <MapModeSwitcher mode={mode} onChange={setMode} />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    map: { flex: 1 },
    pin: {
        width: 18,
        height: 18,
        borderRadius: 9,
        backgroundColor: "#e0733f",
        borderWidth: 2,
        borderColor: "#f6f1e4",
    },
    popup: {
        position: "absolute",
        bottom: 24,
        left: -61,
        width: 160,
        padding: 8,
        borderRadius: 8,
        backgroundColor: "white",
        boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.15)",
        elevation: 3,
    },
    popupTitle: {
        fontWeight: "600",
        textAlign: "center",
    },
});
