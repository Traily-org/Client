import { GlassView, isLiquidGlassAvailable } from "expo-glass-effect";
import {
    Platform,
    View,
    type ColorValue,
    type StyleProp,
    type ViewStyle,
} from "react-native";

import { mapOverlayColors, withAlpha } from "@/constants/theme-colors";

// The map underneath is light whatever the color scheme, so the glass is
// always the light variant (mapOverlayColors), with dark content on it.
export const ON_GLASS = mapOverlayColors.foreground;
export const ON_GLASS_MUTED = withAlpha(mapOverlayColors.foreground, 0.5);

// Real Liquid Glass needs iOS 26+. Elsewhere it's faked with frosted white:
// translucent fill, bright rim, soft drop shadow, plus a backdrop blur on
// web. Android gets a more opaque fill instead of a blur, which can't see
// through the native map surface.
const NATIVE_GLASS = Platform.OS === "ios" && isLiquidGlassAvailable();
const IS_WEB = Platform.OS === "web";

const FALLBACK: ViewStyle = {
    backgroundColor: withAlpha(mapOverlayColors.surface, IS_WEB ? 0.6 : 0.9),
    borderWidth: 1,
    borderColor: withAlpha(mapOverlayColors.surface, 0.85),
    boxShadow: `0px 4px 18px ${withAlpha(mapOverlayColors.shadow, 0.16)}, inset 0px 1px 0px ${withAlpha(mapOverlayColors.surface, 0.9)}`,
};

// Not in React Native's style types, but react-native-web passes it through.
const WEB_BLUR = { backdropFilter: "blur(20px) saturate(180%)" } as ViewStyle;

interface GlassSurfaceProps {
    /** Position, size and border radii of the glass pane. */
    style?: StyleProp<ViewStyle>;
    /** Colored glass, to make a primary action stand out. */
    tint?: ColorValue;
}

/** Glass pane to lay behind a control's content. */
export function GlassSurface({ style, tint }: GlassSurfaceProps) {
    if (NATIVE_GLASS) {
        return (
            <GlassView
                glassEffectStyle="regular"
                colorScheme="light"
                tintColor={tint}
                style={style}
            />
        );
    }
    return (
        <View
            style={[
                FALLBACK,
                IS_WEB && WEB_BLUR,
                tint !== undefined && {
                    backgroundColor: tint,
                    borderColor: withAlpha(mapOverlayColors.surface, 0.45),
                },
                style,
            ]}
        />
    );
}
