import { Stack } from "expo-router";

// Presentation of each screen, as decided in TRA-119 / TRA-123.
export default function AppLayout() {
    return (
        <Stack screenOptions={{ headerShown: true }}>
            <Stack.Screen name="index" options={{ headerShown: false }} />
            {/* Panel over the search results: swipe down goes back to them. */}
            <Stack.Screen
                name="trail/[trailId]"
                options={{
                    presentation: "formSheet",
                    sheetGrabberVisible: true,
                }}
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
                name="settings/credits"
                options={{ title: "Crédits" }}
            />
        </Stack>
    );
}
