import { useRouter } from "expo-router";
import { Keyboard, ScrollView, StyleSheet, Text, View } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useTrailSearch } from "../hooks/use-trail-search";
import type { Trail } from "../types";
import { TrailCard } from "./trail-card";

const TEXT = "#1E1E2F";
const MUTED = "rgba(30, 30, 47, 0.55)";

interface TrailResultsProps {
    query: string;
    /** Called with the trail picked, before its sheet opens. */
    onSelectTrail?: (trail: Trail) => void;
}

/**
 * Trails matching the search query, or recommended trails while it is
 * empty. Cards cascade in when the list appears; picking one opens the
 * trail sheet.
 */
export function TrailResults({ query, onSelectTrail }: TrailResultsProps) {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const { trails, isSearching } = useTrailSearch(query);

    function openTrail(trail: Trail) {
        Keyboard.dismiss();
        onSelectTrail?.(trail);
        router.push({
            pathname: "/trail/[trailId]",
            params: { trailId: trail.id },
        });
    }

    // TODO(perf): switch to a FlatList once results come from the API.
    return (
        <ScrollView
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="on-drag"
            contentContainerStyle={[
                styles.content,
                { paddingBottom: insets.bottom + 24 },
            ]}
        >
            <Text style={styles.heading}>
                {isSearching ? "Résultats" : "Recommandé"}
            </Text>
            <View style={styles.divider} />
            {trails.map((trail, index) => (
                <Animated.View
                    key={trail.id}
                    entering={FadeInDown.duration(320).delay(
                        120 + Math.min(index, 6) * 45,
                    )}
                >
                    <TrailCard trail={trail} onPress={() => openTrail(trail)} />
                </Animated.View>
            ))}
            {isSearching && trails.length === 0 && (
                <Text style={styles.empty}>
                    Aucun sentier ne correspond à « {query.trim()} ».
                </Text>
            )}
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    content: { paddingHorizontal: 16, gap: 12 },
    heading: {
        marginTop: 4,
        fontSize: 20,
        fontWeight: "700",
        color: TEXT,
    },
    divider: {
        height: StyleSheet.hairlineWidth,
        backgroundColor: "rgba(30, 30, 47, 0.15)",
        marginBottom: 4,
    },
    empty: {
        marginTop: 24,
        textAlign: "center",
        fontSize: 15,
        color: MUTED,
    },
});
