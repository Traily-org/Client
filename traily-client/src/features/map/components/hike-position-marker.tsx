import { StyleSheet, View } from "react-native";
import Animated, {
    type SharedValue,
    useAnimatedStyle,
} from "react-native-reanimated";

import { Icon } from "@/components/icon";
import { mapOverlayColors, withAlpha } from "@/constants/theme-colors";

const SIZE = 28;
const HALO_SIZE = 44;
const ACCENT = mapOverlayColors.accent;

interface HikePositionMarkerProps {
    /** Direction of travel, in degrees clockwise from north. */
    heading: number;
    /**
     * Bearing of the map, to turn the arrow against it. Left out where the
     * map turns the marker itself (maplibre-gl on the web).
     */
    mapBearing?: SharedValue<number>;
}

/** The walker during a hike: an orange disc, its arrow pointing their way. */
export function HikePositionMarker({
    heading,
    mapBearing,
}: HikePositionMarkerProps) {
    const arrowStyle = useAnimatedStyle(() => ({
        transform: [{ rotate: `${heading - (mapBearing?.get() ?? 0)}deg` }],
    }));

    return (
        <View
            accessibilityRole="image"
            accessibilityLabel="Ta position"
            style={styles.container}
        >
            <View style={styles.halo} />
            <Animated.View style={[styles.disc, arrowStyle]}>
                <Icon
                    ios="location.north.fill"
                    material="navigation"
                    size={14}
                    color={mapOverlayColors["on-accent"]}
                />
            </Animated.View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        width: HALO_SIZE,
        height: HALO_SIZE,
        alignItems: "center",
        justifyContent: "center",
    },
    halo: {
        ...StyleSheet.absoluteFill,
        borderRadius: HALO_SIZE / 2,
        backgroundColor: withAlpha(ACCENT, 0.2),
    },
    disc: {
        width: SIZE,
        height: SIZE,
        borderRadius: SIZE / 2,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: ACCENT,
        borderWidth: 3,
        borderColor: mapOverlayColors.surface,
        boxShadow: `0px 1px 4px ${withAlpha(mapOverlayColors.shadow, 0.35)}`,
    },
});
