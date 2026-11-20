import * as Haptics from "expo-haptics";
import { useEffect } from "react";
import {
    Pressable,
    StyleSheet,
    type StyleProp,
    type ViewStyle,
} from "react-native";
import Animated, {
    useAnimatedStyle,
    useReducedMotion,
    useSharedValue,
    withTiming,
} from "react-native-reanimated";
import Svg, { Path } from "react-native-svg";

import { EASE_OUT } from "@/constants/motion";

const ACCENT = "#E0733F";
const IDLE = "rgba(30, 30, 47, 0.5)";
const STAR_SIZE = 22;
const STAR_PATH =
    "M12 2.8l2.75 5.84 6.38.78-4.69 4.4 1.2 6.32L12 17.06l-5.64 3.08 1.2-6.32-4.69-4.4 6.38-.78z";

interface TrailFavoriteButtonProps {
    isFavorite: boolean;
    onPress: () => void;
    /** Size, background and position of the round button. */
    style?: StyleProp<ViewStyle>;
}

/**
 * Star outline whose inside fills with the accent color, growing from the
 * center, once the trail is saved; it empties the same way when removed.
 */
export function TrailFavoriteButton({
    isFavorite,
    onPress,
    style,
}: TrailFavoriteButtonProps) {
    const reduceMotion = useReducedMotion();
    const fill = useSharedValue(isFavorite ? 1 : 0);

    useEffect(() => {
        const target = isFavorite ? 1 : 0;
        fill.set(
            reduceMotion
                ? target
                : withTiming(target, { duration: 180, easing: EASE_OUT }),
        );
    }, [isFavorite, reduceMotion, fill]);

    const fillStyle = useAnimatedStyle(() => ({
        opacity: fill.get(),
        transform: [{ scale: fill.get() }],
    }));

    function handlePress() {
        void Haptics.selectionAsync();
        onPress();
    }

    return (
        <Pressable
            onPress={handlePress}
            accessibilityRole="button"
            accessibilityLabel={
                isFavorite ? "Retirer des favoris" : "Ajouter aux favoris"
            }
            accessibilityState={{ selected: isFavorite }}
            hitSlop={6}
            style={style}
        >
            <Animated.View style={[styles.layer, fillStyle]}>
                <Svg width={STAR_SIZE} height={STAR_SIZE} viewBox="0 0 24 24">
                    <Path d={STAR_PATH} fill={ACCENT} />
                </Svg>
            </Animated.View>
            <Svg width={STAR_SIZE} height={STAR_SIZE} viewBox="0 0 24 24">
                <Path
                    d={STAR_PATH}
                    fill="none"
                    stroke={isFavorite ? ACCENT : IDLE}
                    strokeWidth={1.8}
                    strokeLinejoin="round"
                />
            </Svg>
        </Pressable>
    );
}

const styles = StyleSheet.create({
    // Under the outline, centered on it, so it grows from the middle.
    layer: { position: "absolute", pointerEvents: "none" },
});
