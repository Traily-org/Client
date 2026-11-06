import { useRouter } from "expo-router";
import { View } from "react-native";

import { CORNER_BUTTON_SIZE, HomeOverlay } from "@/features/home";
import { TrailyMap } from "@/features/map";

export default function HomeScreen() {
    const router = useRouter();

    // Full-bleed map: the overlay handles the safe areas itself. The map
    // mode switcher is hidden until it finds a place in the new layout
    // (still available on /map). Credits will live in the settings screen:
    // link them from the settings button until it exists.
    return (
        <View className="flex-1">
            <TrailyMap
                bottomOffset={CORNER_BUTTON_SIZE}
                showModeSwitcher={false}
            />
            <HomeOverlay onOpenSettings={() => router.push("/credits")} />
        </View>
    );
}
