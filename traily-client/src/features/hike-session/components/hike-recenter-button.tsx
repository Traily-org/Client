import { StyleSheet } from "react-native";
import Animated, { ZoomIn, ZoomOut } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { GlassButton } from "@/components/glass-button";
import { ON_GLASS } from "@/components/glass-surface";
import { Icon } from "@/components/icon";
import { ENTER_DURATION } from "@/constants/motion";

/** Above the 44 px minimum touch target. */
const SIZE = 52;
/** Room between the button and the corner button below it. */
const GAP = 28;
const SIDE = 12;

interface HikeRecenterButtonProps {
    visible: boolean;
    /** Height of the map's corner buttons, to sit above the right one. */
    cornerButtonSize: number;
    onPress: () => void;
}

/**
 * Round glass button above the bottom right corner, shown once the map was
 * moved by hand during a hike: brings the camera back onto the walker.
 */
export function HikeRecenterButton({
    visible,
    cornerButtonSize,
    onPress,
}: HikeRecenterButtonProps) {
    const insets = useSafeAreaInsets();
    if (!visible) return null;

    return (
        <Animated.View
            entering={ZoomIn.duration(ENTER_DURATION)}
            exiting={ZoomOut.duration(ENTER_DURATION / 2)}
            style={[
                styles.container,
                { bottom: insets.bottom + cornerButtonSize + GAP },
            ]}
        >
            <GlassButton
                accessibilityLabel="Recentrer sur ma position"
                radius={SIZE / 2}
                pressedScale={0.9}
                onPress={onPress}
                style={styles.button}
            >
                <Icon
                    ios="location.north.line.fill"
                    material="navigation"
                    size={22}
                    color={ON_GLASS}
                />
            </GlassButton>
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    container: { position: "absolute", right: SIDE },
    button: {
        width: SIZE,
        height: SIZE,
        alignItems: "center",
        justifyContent: "center",
    },
});
