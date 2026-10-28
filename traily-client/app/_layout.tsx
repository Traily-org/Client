import "@/global.css";

import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useColorScheme } from "react-native";

import { useHydrateSession } from "@/features/auth";
import { useSessionStore } from "@/store/session";

SplashScreen.preventAutoHideAsync();

export default function TabLayout() {
    const colorScheme = useColorScheme();
    const status = useSessionStore((s) => s.status);
    useHydrateSession();

    // The splash screen stays up until the stored session is known.
    if (status === "loading") return null;

    const signedIn = status === "authenticated";
    return (
        <ThemeProvider
            value={colorScheme === "dark" ? DarkTheme : DefaultTheme}
        >
            <Stack screenOptions={{ headerShown: false }}>
                <Stack.Protected guard={signedIn}>
                    <Stack.Screen name="index" />
                    <Stack.Screen name="map" />
                    <Stack.Screen name="credits" />
                </Stack.Protected>
                <Stack.Protected guard={!signedIn}>
                    <Stack.Screen name="auth" />
                </Stack.Protected>
            </Stack>
        </ThemeProvider>
    );
}
