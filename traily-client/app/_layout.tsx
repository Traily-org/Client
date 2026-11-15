import "@/global.css";

import { Stack } from "expo-router";

import { ThemeRoot } from "@/components/theme-root";

export default function RootLayout() {
    return (
        <ThemeRoot>
            <Stack screenOptions={{ headerShown: false }} />
        </ThemeRoot>
    );
}
