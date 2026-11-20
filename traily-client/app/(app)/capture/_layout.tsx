import { Stack } from "expo-router";

// Camera, then identification: one modal with its own stack (see (app)/_layout).
export default function CaptureLayout() {
    return <Stack screenOptions={{ headerShown: true }} />;
}
