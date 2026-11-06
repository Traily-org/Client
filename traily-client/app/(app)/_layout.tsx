import { Stack } from "expo-router";

export default function AppLayout() {
    return (
        <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen
                name="settings/index"
                options={{ headerShown: true, title: "Paramètres" }}
            />
            <Stack.Screen
                name="settings/credits"
                options={{ headerShown: true, title: "Crédits" }}
            />
        </Stack>
    );
}
