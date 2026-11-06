import { Link } from "expo-router";
import { Pressable, StyleSheet, Text } from "react-native";
import {
    SafeAreaView,
    useSafeAreaInsets,
} from "react-native-safe-area-context";

import { TrailyMap } from "@/features/map";

export default function MapScreen() {
    const insets = useSafeAreaInsets();

    return (
        <SafeAreaView style={styles.container} edges={["top"]}>
            <TrailyMap />
            {/* TODO(design): temporary button style and glyph, to replace with the design system's icon button. */}
            <Link href="/settings" asChild>
                <Pressable
                    accessibilityRole="button"
                    accessibilityLabel="Paramètres"
                    className="absolute right-4 h-10 w-10 items-center justify-center rounded-full bg-white/90 shadow-md"
                    style={{ top: insets.top + 12 }}
                >
                    <Text className="text-xl text-[#5c3b23]">⚙</Text>
                </Pressable>
            </Link>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
});
