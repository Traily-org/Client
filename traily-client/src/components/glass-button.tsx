import * as Haptics from "expo-haptics";
import type { ReactNode } from "react";
import {
    Pressable,
    StyleSheet,
    View,
    type ColorValue,
    type StyleProp,
    type ViewStyle,
} from "react-native";
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withTiming,
} from "react-native-reanimated";

import { GlassSurface } from "./glass-surface";
import { PRESS_IN, PRESS_OUT } from "@/constants/motion";

export interface CornerRadii {
    topLeft?: number;
    topRight?: number;
    bottomLeft?: number;
    bottomRight?: number;
}

interface GlassButtonProps {
    accessibilityLabel: string;
    /** One radius for every corner, or one per corner. */
    radius: number | CornerRadii;
    /** Size, padding and content alignment. */
    style?: StyleProp<ViewStyle>;
    /** Point the button shrinks towards, e.g. the screen corner it sits in. */
    transformOrigin?: ViewStyle["transformOrigin"];
    pressedScale?: number;
    haptic?: Haptics.ImpactFeedbackStyle;
    /** Colored glass, to make a primary action stand out. */
    tint?: ColorValue;
    onPress?: () => void;
    children: ReactNode;
}

function radiusStyle(radius: number | CornerRadii): ViewStyle {
    if (typeof radius === "number") return { borderRadius: radius };
    return {
        borderTopLeftRadius: radius.topLeft,
        borderTopRightRadius: radius.topRight,
        borderBottomLeftRadius: radius.bottomLeft,
        borderBottomRightRadius: radius.bottomRight,
    };
}

/**
 * Glass button that shrinks slightly and brightens under the finger, then
 * settles back, with a haptic tick on press.
 */
export function GlassButton({
    accessibilityLabel,
    radius,
    style,
    transformOrigin = "center",
    pressedScale = 0.95,
    haptic = Haptics.ImpactFeedbackStyle.Light,
    tint,
    onPress,
    children,
}: GlassButtonProps) {
    const pressed = useSharedValue(0);
    const radii = radiusStyle(radius);

    const pressStyle = useAnimatedStyle(() => ({
        transform: [{ scale: 1 - (1 - pressedScale) * pressed.get() }],
    }));
    const highlightStyle = useAnimatedStyle(() => ({
        opacity: pressed.get(),
    }));

    function handlePressIn() {
        void Haptics.impactAsync(haptic);
        pressed.set(withTiming(1, PRESS_IN));
    }

    function handlePressOut() {
        pressed.set(withTiming(0, PRESS_OUT));
    }

    return (
        <Pressable
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            onPress={onPress}
            accessibilityRole="button"
            accessibilityLabel={accessibilityLabel}
        >
            <Animated.View style={[style, { transformOrigin }, pressStyle]}>
                <GlassSurface
                    style={[StyleSheet.absoluteFill, radii]}
                    tint={tint}
                />
                <View style={[StyleSheet.absoluteFill, radii, styles.clip]}>
                    <Animated.View style={[styles.highlight, highlightStyle]} />
                </View>
                {children}
            </Animated.View>
        </Pressable>
    );
}

const styles = StyleSheet.create({
    clip: { overflow: "hidden", pointerEvents: "none" },
    highlight: {
        ...StyleSheet.absoluteFill,
        backgroundColor: "rgba(255, 255, 255, 0.35)",
    },
});
