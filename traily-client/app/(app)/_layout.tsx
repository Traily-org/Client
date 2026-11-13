import { Stack } from "expo-router";

import { HeaderCloseButton } from "@/components/header-close-button";

/** Screens opened from the settings: a modal with a "Fermer" button. */
function settingsModal(title: string) {
    return {
        title,
        presentation: "modal" as const,
        headerRight: () => <HeaderCloseButton href="/settings" />,
    };
}

// Presentation of each screen, as decided in TRA-119 / TRA-123.
export default function AppLayout() {
    return (
        <Stack screenOptions={{ headerShown: true }}>
            <Stack.Screen name="index" options={{ headerShown: false }} />
            {/* Panel over the search results: swipe down goes back to them.
                The sheet draws its own header (favorite, close). */}
            <Stack.Screen
                name="trail/[trailId]"
                options={{
                    presentation: "formSheet",
                    sheetGrabberVisible: true,
                    headerShown: false,
                }}
            />
            {/* Over the trail sheet, which a pushed screen would go under. */}
            <Stack.Screen
                name="user/[userId]"
                options={{ presentation: "modal" }}
            />
            {/* Camera then identification, back to the hike when done. */}
            <Stack.Screen
                name="capture"
                options={{
                    presentation: "fullScreenModal",
                    headerShown: false,
                }}
            />
            {/* No swipe-to-dismiss: the hike is not saved yet. */}
            <Stack.Screen
                name="hike-summary"
                options={{ presentation: "modal", gestureEnabled: false }}
            />
            <Stack.Screen
                name="settings/index"
                options={{ title: "Paramètres" }}
            />
            <Stack.Screen
                name="settings/personal-info"
                options={settingsModal("Mes informations")}
            />
            <Stack.Screen
                name="settings/credits"
                options={settingsModal("Crédits")}
            />
            {/* Full page with a back button: the onboarding is a multi-page flow. */}
            <Stack.Screen
                name="settings/onboarding"
                options={{ title: "Onboarding éthique" }}
            />
        </Stack>
    );
}
