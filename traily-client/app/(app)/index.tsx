import { type ErrorBoundaryProps, useRouter } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";

import {
    HikeActionBar,
    HikeStatusCard,
    selectHikeTrail,
    useHikeSession,
} from "@/features/hike-session";
import { CORNER_BUTTON_SIZE, MapControls, TrailyMap } from "@/features/map";
import {
    TrailPreview,
    TrailResults,
    useHomeMapTrails,
} from "@/features/trails";

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
// closes the search. The map draws the trails around what it shows, the
// picked one on top (TRA-137). Touching a trail (or a long press) frames
// it, focuses it and shows its preview, which opens its sheet; zooming in on
// a single trail focuses it too, without moving the map. During a hike,
// zooming no longer focuses trails.
export default function MapScreen() {
    const router = useRouter();
    const hike = useHikeSession();
    const mapTrails = useHomeMapTrails({ zoomFocus: hike.status === "idle" });

    function openTrail(trailId: string) {
        router.push({ pathname: "/trail/[trailId]", params: { trailId } });
    }

    return (
        <View style={styles.container}>
            <TrailyMap
                bottomOffset={CORNER_BUTTON_SIZE}
                trails={mapTrails.trails}
                highlightedTrailId={hike.trail?.id}
                focusedTrailId={mapTrails.focusedTrailId}
                onViewportChange={mapTrails.updateViewport}
                onPressTrail={mapTrails.focusTrail}
                onPressMap={mapTrails.closeFocus}
            />
            <HikeActionBar cornerButtonSize={CORNER_BUTTON_SIZE} />
            <TrailPreview
                trailId={mapTrails.focusedTrailId}
                cornerButtonSize={CORNER_BUTTON_SIZE}
                onOpen={openTrail}
                onClose={mapTrails.closeFocus}
            />
            <MapControls
                belowSearch={<HikeStatusCard />}
                renderSearchResults={({
                    query,
                    closeSearch,
                    focusCount,
                    coverProgress,
                }) => (
                    <TrailResults
                        query={query}
                        searchFocusCount={focusCount}
                        sheetOpenness={coverProgress}
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
