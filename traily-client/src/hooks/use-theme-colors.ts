import { useColorScheme } from "nativewind";

import {
    type ColorScheme,
    type ThemeColors,
    themeColors,
} from "@/constants/theme-colors";

/** Light or dark, as applied right now (after "system" is resolved). */
export function useResolvedColorScheme(): ColorScheme {
    const { colorScheme } = useColorScheme();
    return colorScheme === "dark" ? "dark" : "light";
}

/**
 * Hex colors of the current scheme, for what takes no class: icons, native
 * switches, navigation. Prefer the `bg-<role>` / `text-<role>` classes.
 */
export function useThemeColors(): ThemeColors {
    return themeColors[useResolvedColorScheme()];
}
