import type { ReactNode } from "react";
import { StyleSheet, useWindowDimensions } from "react-native";
import Animated, {
    interpolate,
    useAnimatedStyle,
    type SharedValue,
} from "react-native-reanimated";

// Same light tone as the glass controls, opaque: the search bar stays on top
// and reads as part of the panel once it has risen.
const PANEL_BACKGROUND = "#F4F2F8";
const TOP_RADIUS = 28;

interface SearchPanelProps {
    /** 0 = hidden below the screen, 1 = fills the screen. */
    progress: SharedValue<number>;
    /** Space left at the top for the search bar. */
    contentTop: number;
    children: ReactNode;
}

/**
 * Full-screen panel that rises from the bottom behind the search bar. Its
 * top corners flatten as it reaches the top so it merges into the bar.
 */
export function SearchPanel({
    progress,
    contentTop,
    children,
}: SearchPanelProps) {
    const { height } = useWindowDimensions();

    const panelStyle = useAnimatedStyle(() => {
        const p = progress.get();
        const radius = interpolate(p, [0.75, 1], [TOP_RADIUS, 0], "clamp");
        return {
            transform: [{ translateY: interpolate(p, [0, 1], [height, 0]) }],
            borderTopLeftRadius: radius,
            borderTopRightRadius: radius,
        };
    });

    return (
        <Animated.View
            style={[styles.panel, { paddingTop: contentTop }, panelStyle]}
        >
            {children}
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    panel: {
        ...StyleSheet.absoluteFill,
        overflow: "hidden",
        backgroundColor: PANEL_BACKGROUND,
        boxShadow: "0px -8px 28px rgba(20, 20, 40, 0.18)",
    },
});
