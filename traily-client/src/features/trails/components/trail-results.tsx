import { useState } from "react";
import type { SharedValue } from "react-native-reanimated";
import { Keyboard, ScrollView, StyleSheet, Text, View } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useTrailSearch } from "../hooks/use-trail-search";
import type { Trail } from "../types";
import type { TrailSelectState } from "./select-trail-button";
import { TrailCard } from "./trail-card";
import { TrailSheetPanel } from "./trail-sheet-panel";

const TEXT = "#1E1E2F";
const MUTED = "rgba(30, 30, 47, 0.55)";

interface TrailResultsProps {
    query: string;
    /** Bumped on each focus of the search field, which lowers the sheet. */
    searchFocusCount?: number;
    /** Set to how far a trail sheet is open, 0 to 1. */
    sheetOpenness?: SharedValue<number>;
    /** Called by the "Choisir" button of a trail's sheet. */
    onSelectTrail?: (trail: Trail) => void;
    /** Trail already picked for the hike, if any. */
    selectedTrailId?: string;
    /** True while a hike is in progress: its trail can't change. */
    selectionLocked?: boolean;
}

/**
 * Trails matching the search query, or recommended trails while it is
 * empty. Cards cascade in when the list appears; touching one raises its
 * sheet over the list, which comes back once the sheet is closed.
 */
export function TrailResults({
    query,
    searchFocusCount = 0,
    sheetOpenness,
    onSelectTrail,
    selectedTrailId,
    selectionLocked = false,
}: TrailResultsProps) {
    const insets = useSafeAreaInsets();
    const { trails, isSearching } = useTrailSearch(query);
    const [openTrail, setOpenTrail] = useState<{
        id: string;
        /** Search focus count when it opened: a later focus closes it. */
        focusCount: number;
    } | null>(null);

    function showTrail(trail: Trail) {
        Keyboard.dismiss();
        setOpenTrail({ id: trail.id, focusCount: searchFocusCount });
    }

    function getSelectState(trailId: string): TrailSelectState {
        if (selectionLocked) return "locked";
        return trailId === selectedTrailId ? "selected" : "available";
    }

    // TODO(perf): switch to a FlatList once results come from the API.
    return (
        <View style={styles.container}>
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
                        <TrailCard
                            trail={trail}
                            onPress={() => showTrail(trail)}
                        />
                    </Animated.View>
                ))}
                {isSearching && trails.length === 0 && (
                    <Text style={styles.empty}>
                        Aucun sentier ne correspond à « {query.trim()} ».
                    </Text>
                )}
            </ScrollView>
            {openTrail && (
                <TrailSheetPanel
                    key={openTrail.id}
                    trailId={openTrail.id}
                    closeRequested={searchFocusCount !== openTrail.focusCount}
                    selectState={getSelectState(openTrail.id)}
                    onSelect={(trail) => onSelectTrail?.(trail)}
                    onDismissed={() => setOpenTrail(null)}
                    openness={sheetOpenness}
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
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
