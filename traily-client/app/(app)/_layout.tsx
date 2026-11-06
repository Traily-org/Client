import { Stack } from "expo-router";

export default function AppLayout() {
    return (
        <Stack screenOptions={{ headerShown: true }}>
            <Stack.Screen name="index" options={{ headerShown: false }} />
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
