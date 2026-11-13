import { DarkTheme, DefaultTheme, ThemeProvider } from "expo-router";
import { useColorScheme, vars } from "nativewind";
import { type ReactNode, useEffect } from "react";
import { View } from "react-native";

import { themeColors, toCssVariables } from "@/constants/theme-colors";
import { useResolvedColorScheme } from "@/hooks/use-theme-colors";
import { useThemePreference } from "@/hooks/use-theme-preference";

const schemeVariables = {
    light: vars(toCssVariables(themeColors.light)),
    dark: vars(toCssVariables(themeColors.dark)),
};

/**
 * Applies the theme to the whole app: the user's choice (light, dark or
 * system), the color roles behind the `bg-<role>` classes, and the matching
 * navigation theme for the headers.
 */
export function ThemeRoot({ children }: { children: ReactNode }) {
    const preference = useThemePreference();
    const { setColorScheme } = useColorScheme();
    const scheme = useResolvedColorScheme();

    // Applied on launch too: with darkMode "class", NativeWind starts in light
    // on web even when the device is dark, until "system" is set.
    useEffect(() => {
        setColorScheme(preference);
    }, [preference, setColorScheme]);

    return (
        <View className="flex-1" style={schemeVariables[scheme]}>
            <ThemeProvider value={scheme === "dark" ? DarkTheme : DefaultTheme}>
                {children}
            </ThemeProvider>
        </View>
    );
}
