import { useRouter } from "expo-router";
import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

// TODO(design): temporary hike action bar over the map, to reach the hike
// flow screens. The real one replaces it in its feature. Search, settings,
// team and profile are already the real controls (MapControls).
export function ScaffoldMapControls() {
    const insets = useSafeAreaInsets();
    const router = useRouter();
    const [hiking, setHiking] = useState(false);

    // Bottom center, between the map's corner buttons.
    return (
        <View style={[styles.bar, { bottom: insets.bottom + 24 }]}>
            {hiking ? (
                <>
                    <MapButton
                        label="Photo"
                        onPress={() => router.push("/capture")}
                    />
                    <MapButton
                        label="Terminer"
                        onPress={() => {
                            setHiking(false);
                            router.push("/hike-summary");
                        }}
                    />
                </>
            ) : (
                <MapButton label="Démarrer" onPress={() => setHiking(true)} />
            )}
        </View>
    );
}

function MapButton({ label, onPress }: { label: string; onPress: () => void }) {
    return (
        <Pressable
            accessibilityRole="button"
            onPress={onPress}
            className="rounded-full bg-white/90 px-4 py-2 shadow-md"
        >
            <Text className="font-semibold text-[#5c3b23]">{label}</Text>
        </Pressable>
    );
}

const styles = StyleSheet.create({
    // Full width to center the buttons, but lets touches through to the
    // corner buttons on each side.
    bar: {
        position: "absolute",
        left: 0,
        right: 0,
        flexDirection: "row",
        justifyContent: "center",
        gap: 8,
        pointerEvents: "box-none",
    },
});
