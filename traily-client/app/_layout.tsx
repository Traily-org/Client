import "@/global.css";

import { DarkTheme, DefaultTheme, Slot, ThemeProvider } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useColorScheme } from "react-native";

import { useHydrateSession } from "@/features/auth";

SplashScreen.preventAutoHideAsync();

export default function TabLayout() {
    const colorScheme = useColorScheme();
    useHydrateSession();
    return (
        <ThemeProvider
            value={colorScheme === "dark" ? DarkTheme : DefaultTheme}
        >
            <Slot />
        </ThemeProvider>
    );
}
