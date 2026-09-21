import {
    Camera,
    Map,
    Marker,
    OfflineManager,
    type StyleSpecification,
} from "@maplibre/maplibre-react-native";
import { useEffect, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import {
    getTrailyMapStyle,
    MIN_ZOOM,
    PMTILES_URL,
} from "./style/get-traily-map-style";

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

    return (
        <Map
            style={styles.map}
            mapStyle={
                getTrailyMapStyle(
                    `pmtiles://${PMTILES_URL}`,
                ) as StyleSpecification
            }
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
    );
}

const styles = StyleSheet.create({
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
        shadowColor: "#000",
        shadowOpacity: 0.15,
        shadowRadius: 4,
        shadowOffset: { width: 0, height: 2 },
        elevation: 3,
    },
    popupTitle: {
        fontWeight: "600",
        textAlign: "center",
    },
});
