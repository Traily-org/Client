import { Image } from "expo-image";
import { Pressable, StyleSheet, View } from "react-native";

import { mapOverlayColors, withAlpha } from "@/constants/theme-colors";

const FRAME = 46;
const BORDER = 3;
const POINTER = 10;

/** Total height, from the top of the frame to the tip of the pointer. */
const PHOTO_PIN_HEIGHT = FRAME + POINTER / 2;

/**
 * Room kept around a route framed on the map, so the pins standing on it
 * stay inside. The bottom leaves room for the legal notices.
 */
export const ROUTE_MAP_PADDING = {
    top: PHOTO_PIN_HEIGHT + 12,
    right: FRAME / 2 + 12,
    bottom: 36,
    left: FRAME / 2 + 12,
};

interface PhotoPinMarkerProps {
    photoUrl: string;
    label: string;
    /**
     * Touching the pin. Web only: on native, the map hands the touch to its
     * `Marker` (`onPress` there), never to a view inside it.
     */
    onPress?: () => void;
    /** Read as a button by screen readers. Defaults to having `onPress`. */
    pressable?: boolean;
}

/**
 * Photo thumbnail in a white frame with a pointer at the bottom, anchored
 * by its tip on the spot it shows. Shared by the native and web maps.
 */
export function PhotoPinMarker({
    photoUrl,
    label,
    onPress,
    pressable = onPress !== undefined,
}: PhotoPinMarkerProps) {
    return (
        <Pressable
            onPress={onPress}
            disabled={!onPress}
            accessibilityRole={pressable ? "imagebutton" : "image"}
            accessibilityLabel={label}
            style={styles.container}
        >
            <View style={styles.pointer} />
            <View style={styles.frame}>
                <Image
                    source={{ uri: photoUrl }}
                    style={styles.photo}
                    contentFit="cover"
                    transition={200}
                />
            </View>
        </Pressable>
    );
}

const styles = StyleSheet.create({
    container: {
        width: FRAME,
        height: PHOTO_PIN_HEIGHT,
        alignItems: "center",
    },
    frame: {
        width: FRAME,
        height: FRAME,
        padding: BORDER,
        borderRadius: 12,
        backgroundColor: mapOverlayColors.surface,
        boxShadow: `0px 2px 6px ${withAlpha(mapOverlayColors.shadow, 0.3)}`,
    },
    photo: {
        flex: 1,
        borderRadius: 12 - BORDER,
        backgroundColor: mapOverlayColors.placeholder,
    },
    // Rotated square half hidden behind the frame: only its lower corner
    // shows, as the tip. `bottom` puts that corner on the container's edge.
    pointer: {
        position: "absolute",
        bottom: (POINTER * Math.SQRT2 - POINTER) / 2,
        width: POINTER,
        height: POINTER,
        backgroundColor: mapOverlayColors.surface,
        transform: [{ rotate: "45deg" }],
        boxShadow: `0px 2px 4px ${withAlpha(mapOverlayColors.shadow, 0.25)}`,
    },
});
