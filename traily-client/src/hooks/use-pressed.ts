import { useState } from "react";

/**
 * Pressed state of a `Pressable`, for its press feedback:
 * `<Pressable {...pressHandlers} style={[styles.row, pressed && styles.pressed]}>`.
 *
 * Use it instead of `style={({ pressed }) => ...}`: on Android and iOS,
 * NativeWind's wrapper around `Pressable` drops a style given as a function,
 * and the whole style is lost (layout, background, size). The web keeps it,
 * which hides the bug there. ESLint flags such style functions.
 */
export function usePressed() {
    const [pressed, setPressed] = useState(false);
    return {
        pressed,
        pressHandlers: {
            onPressIn: () => setPressed(true),
            onPressOut: () => setPressed(false),
        },
    };
}
