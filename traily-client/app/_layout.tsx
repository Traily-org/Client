import "@/global.css";

import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";

import { ThemeRoot } from "@/components/theme-root";
import { useHydrateSession } from "@/features/auth";
import { useSessionStore } from "@/store/session";

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
    const status = useSessionStore((s) => s.status);
    useHydrateSession();

    // The splash screen stays up until the stored session is known.
    if (status === "loading") return null;

    const signedIn = status === "authenticated";
    return (
        <ThemeRoot>
            <Stack screenOptions={{ headerShown: false }}>
                <Stack.Protected guard={signedIn}>
                    <Stack.Screen name="(app)" />
                    <Stack.Screen name="onboarding" />
                </Stack.Protected>
                <Stack.Protected guard={!signedIn}>
                    <Stack.Screen name="(public)" />
                </Stack.Protected>
            </Stack>
        </ThemeRoot>
    );
}
