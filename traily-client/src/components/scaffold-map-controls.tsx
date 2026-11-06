import { Link, useRouter } from "expo-router";
import { useState } from "react";
import { Pressable, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

// TODO(design): temporary controls over the map to reach every screen of the
// navigation map. The real search bar, social panel, profile button and hike
// action bar replace them, each in its feature.
export function ScaffoldMapControls() {
    const insets = useSafeAreaInsets();
    const router = useRouter();
    const [socialOpen, setSocialOpen] = useState(false);
    const [hiking, setHiking] = useState(false);

    // Above the map mode switcher and the MapTiler legal notices.
    const bottom = insets.bottom + 72;

    return (
        <>
            <View
                className="absolute left-4 right-4 flex-row items-center gap-3"
                style={{ top: insets.top + 12 }}
            >
                <Link href="/search" asChild>
                    <Pressable className="h-10 flex-1 justify-center rounded-full bg-white/90 px-4 shadow-md">
                        <Text className="text-gray-500">
                            Rechercher une rando…
                        </Text>
                    </Pressable>
                </Link>
                <Link href="/settings" asChild>
                    <Pressable
                        accessibilityRole="button"
                        accessibilityLabel="Paramètres"
                        className="h-10 w-10 items-center justify-center rounded-full bg-white/90 shadow-md"
                    >
                        <Text className="text-xl text-[#5c3b23]">⚙</Text>
                    </Pressable>
                </Link>
            </View>

            {socialOpen && (
                <View
                    className="absolute left-4 gap-2 rounded-xl bg-white/95 p-3 shadow-md"
                    style={{ bottom: bottom + 52 }}
                >
                    <Link href="/leaderboard" className="py-1 text-base">
                        Classements
                    </Link>
                    <Link href="/team" className="py-1 text-base">
                        Équipe
                    </Link>
                </View>
            )}

            <View
                className="absolute left-4 right-4 flex-row items-center justify-between"
                style={{ bottom }}
            >
                <MapButton
                    label="Social"
                    onPress={() => setSocialOpen((open) => !open)}
                />
                {hiking ? (
                    <View className="flex-row gap-2">
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
                    </View>
                ) : (
                    <MapButton
                        label="Démarrer"
                        onPress={() => setHiking(true)}
                    />
                )}
                <MapButton
                    label="Profil"
                    onPress={() => router.push("/profile")}
                />
            </View>
        </>
    );
}

function MapButton({ label, onPress }: { label: string; onPress: () => void }) {
    return (
        <Pressable
            onPress={onPress}
            className="rounded-full bg-white/90 px-4 py-2 shadow-md"
        >
            <Text className="font-semibold text-[#5c3b23]">{label}</Text>
        </Pressable>
    );
}
