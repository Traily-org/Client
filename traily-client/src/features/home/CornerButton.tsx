import * as Haptics from "expo-haptics";
import type { ReactNode } from "react";
import { Text } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { GlassButton } from "./GlassButton";
import { ON_GLASS } from "./GlassSurface";
import { ENTER_DURATION } from "./motion";

/** Height of a corner button above the bottom safe area. */
export const CORNER_BUTTON_SIZE = 92;
const WIDTH = 116;

// The corner facing the map gets the wider curve; the two sides against the
// screen edges stay flat.
const INNER_RADIUS = 46;
const OUTER_RADIUS = 28;

interface CornerButtonProps {
    corner: "left" | "right";
    label: string;
    icon: ReactNode;
    /** Delay before appearing when the screen opens, in ms. */
    enterDelay?: number;
    onPress?: () => void;
}

/**
 * Big glass button glued to a bottom corner of the screen, extending under
 * the bottom safe area. Shrinks towards its corner when pressed.
 */
export function CornerButton({
    corner,
    label,
    icon,
    enterDelay = 0,
    onPress,
}: CornerButtonProps) {
    const insets = useSafeAreaInsets();
    const isLeft = corner === "left";

    return (
        <Animated.View
            entering={FadeInDown.duration(ENTER_DURATION).delay(enterDelay)}
            style={{
                position: "absolute",
                bottom: 0,
                left: isLeft ? 0 : undefined,
                right: isLeft ? undefined : 0,
            }}
        >
            <GlassButton
                accessibilityLabel={label}
                radius={{
                    topLeft: isLeft ? OUTER_RADIUS : INNER_RADIUS,
                    topRight: isLeft ? INNER_RADIUS : OUTER_RADIUS,
                }}
                transformOrigin={isLeft ? "left bottom" : "right bottom"}
                haptic={Haptics.ImpactFeedbackStyle.Medium}
                onPress={onPress}
                style={{
                    width: WIDTH,
                    height: CORNER_BUTTON_SIZE + insets.bottom,
                    paddingBottom: insets.bottom,
                    // Nudge the content away from the inner curve.
                    paddingLeft: isLeft ? 0 : 8,
                    paddingRight: isLeft ? 8 : 0,
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 4,
                }}
            >
                {icon}
                <Text
                    className="text-xs font-semibold"
                    style={{ color: ON_GLASS }}
                >
                    {label}
                </Text>
            </GlassButton>
        </Animated.View>
    );
}
