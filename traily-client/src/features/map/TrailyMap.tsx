import {
    Camera,
    Map,
    Marker,
    OfflineManager,
    type StyleSpecification,
} from "@maplibre/maplibre-react-native";
import { useEffect, useMemo, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

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

    useEffect(() => {
        if (ambientCacheConfigured) return;
        ambientCacheConfigured = true;
        void OfflineManager.setMaximumAmbientCacheSize(
            AMBIENT_CACHE_SIZE_BYTES,
        );
    }, []);

    if (!PMTILES_URL) {
        throw new Error(
            "EXPO_PUBLIC_PM_TILES_URL is not set (see traily-client/.env)",
        );
    }

    const mapStyle = useMemo(
        () =>
            getMapStyle(mode, `pmtiles://${PMTILES_URL}`) as StyleSpecification,
        [mode],
    );

    return (
        <View style={styles.container}>
            {/* No built-in attribution button or compass — this app renders
                its own map chrome (MapModeSwitcher). Source attributions
                still need to live somewhere in the app (a credits/about
                screen, not on the map itself) to stay compliant with
                OSM/Protomaps/Esri's terms. */}
            <Map
                style={styles.map}
                mapStyle={mapStyle}
                attribution={false}
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
