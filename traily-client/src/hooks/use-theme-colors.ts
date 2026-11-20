import { useColorScheme } from "nativewind";

import { useThemePreference } from "./use-theme-preference";
import {
    type ColorScheme,
    type ThemeColors,
    themeColors,
} from "@/constants/theme-colors";

/**
 * Light or dark, as applied right now. A forced choice is used as is: on
 * native, NativeWind only updates its scheme on a native appearance event,
 * which a manual switch does not always send. "system" reads NativeWind, which
 * follows the device on every platform (React Native's own hook misses the
 * changes on web once NativeWind manages the scheme).
 */
export function useResolvedColorScheme(): ColorScheme {
    const preference = useThemePreference();
    const { colorScheme } = useColorScheme();
    if (preference !== "system") return preference;
    return colorScheme === "dark" ? "dark" : "light";
}

/**
 * Hex colors of the current scheme, for what takes no class: icons, native
 * switches, navigation. Prefer the `bg-<role>` / `text-<role>` classes.
 */
export function useThemeColors(): ThemeColors {
    return themeColors[useResolvedColorScheme()];
}
