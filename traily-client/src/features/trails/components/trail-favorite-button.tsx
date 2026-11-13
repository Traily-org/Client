import * as Haptics from "expo-haptics";
import { Pressable } from "react-native";
import Animated, {
    useAnimatedStyle,
    useReducedMotion,
    useSharedValue,
    withSequence,
    withSpring,
    withTiming,
} from "react-native-reanimated";

import { Icon } from "@/components/icon";
import { EASE_OUT } from "@/constants/motion";

const ACCENT = "#E0733F";
const IDLE = "rgba(30, 30, 47, 0.45)";

interface TrailFavoriteButtonProps {
    isFavorite: boolean;
    onPress: () => void;
    size: number;
}

/**
 * Star that fills with the accent color once the trail is saved. It pops
 * and tilts on each press, then springs back.
 */
export function TrailFavoriteButton({
    isFavorite,
    onPress,
    size,
}: TrailFavoriteButtonProps) {
    const reduceMotion = useReducedMotion();
    const pop = useSharedValue(0);

    const starStyle = useAnimatedStyle(() => ({
        transform: [
            { scale: 1 + 0.4 * pop.get() },
            { rotate: `${-18 * pop.get()}deg` },
        ],
    }));

    function handlePress() {
        void Haptics.impactAsync(
            isFavorite
                ? Haptics.ImpactFeedbackStyle.Light
                : Haptics.ImpactFeedbackStyle.Medium,
        );
        if (!reduceMotion) {
            pop.set(
                withSequence(
                    withTiming(1, { duration: 130, easing: EASE_OUT }),
                    withSpring(0, { damping: 7, stiffness: 260 }),
                ),
            );
        }
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
            hitSlop={4}
            style={{
                width: size,
                height: size,
                alignItems: "center",
                justifyContent: "center",
            }}
        >
            <Animated.View style={starStyle}>
                <Icon
                    ios={isFavorite ? "star.fill" : "star"}
                    material="star"
                    size={20}
                    color={isFavorite ? ACCENT : IDLE}
                />
            </Animated.View>
        </Pressable>
    );
}
