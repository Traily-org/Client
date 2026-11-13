import { useRouter } from "expo-router";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useTrailDetails } from "../hooks/use-trail-details";
import { TrailDetailsCard } from "./trail-details-card";
import { TRAIL_SHEET_BACKGROUND } from "./trail-sheet-panel";
import { TrailSheetActions } from "./trail-sheet-actions";

const MUTED = "rgba(30, 30, 47, 0.55)";

interface TrailSheetProps {
    trailId: string;
}

/**
 * Trail sheet as a screen of its own, for the links to a trail from outside
 * the search (history, deep links). The search opens `TrailSheetPanel`
 * instead.
 */
export function TrailSheet({ trailId }: TrailSheetProps) {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const trail = useTrailDetails(trailId);

    function close() {
        if (router.canGoBack()) router.back();
        else router.replace("/");
    }

    return (
        <ScrollView
            style={styles.screen}
            contentContainerStyle={[
                styles.content,
                { paddingBottom: insets.bottom + 24 },
            ]}
        >
            <View style={styles.actions}>
                <TrailSheetActions
                    trailId={trailId}
                    showFavorite={trail !== undefined}
                    onClose={close}
                />
            </View>
            {trail ? (
                <TrailDetailsCard trail={trail} />
            ) : (
                <Text style={styles.missing}>Sentier introuvable.</Text>
            )}
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    screen: { flex: 1, backgroundColor: TRAIL_SHEET_BACKGROUND },
    content: { paddingHorizontal: 16, paddingTop: 20, gap: 12 },
    actions: { alignItems: "flex-end" },
    missing: {
        marginTop: 48,
        textAlign: "center",
        fontSize: 15,
        color: MUTED,
    },
});
