import type { ErrorBoundaryProps } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";

import {
    HikeActionBar,
    HikeStatusCard,
    selectHikeTrail,
    useHikeSession,
} from "@/features/hike-session";
import { CORNER_BUTTON_SIZE, MapControls, TrailyMap } from "@/features/map";
import { TrailResults } from "@/features/trails";

// Catches a map style that failed to load (network error, missing key)
// instead of crashing the whole app. Retrying refetches the style.
export function ErrorBoundary({ retry }: ErrorBoundaryProps) {
    return (
        <View className="flex-1 items-center justify-center gap-4 p-6">
            <Text className="text-center text-base">
                Impossible de charger la carte. Vérifie ta connexion.
            </Text>
            <Pressable
                accessibilityRole="button"
                onPress={retry}
                className="rounded-xl bg-[#e0733f] px-4 py-3"
            >
                <Text className="font-semibold text-white">Réessayer</Text>
            </Pressable>
        </View>
    );
}

// Full-bleed map: the controls handle the safe areas themselves. The hike
// bar comes before MapControls so the search panel covers it. Choosing a
// trail from its sheet in the search sets the trail of the next hike and
// closes the search.
export default function MapScreen() {
    const hike = useHikeSession();

    return (
        <View style={styles.container}>
            <TrailyMap bottomOffset={CORNER_BUTTON_SIZE} />
            <HikeActionBar cornerButtonSize={CORNER_BUTTON_SIZE} />
            <MapControls
                belowSearch={<HikeStatusCard />}
                renderSearchResults={({ query, closeSearch, focusCount }) => (
                    <TrailResults
                        query={query}
                        searchFocusCount={focusCount}
                        selectedTrailId={hike.trail?.id}
                        selectionLocked={hike.status !== "idle"}
                        onSelectTrail={(trail) => {
                            selectHikeTrail(trail);
                            closeSearch();
                        }}
                    />
                )}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
});
