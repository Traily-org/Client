import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Icon } from "@/components/icon";

import { useFavoriteTrail } from "../hooks/use-favorite-trail";
import { useTrailDetails } from "../hooks/use-trail-details";
import type { TrailDetails } from "../types";
import {
    SelectTrailButton,
    type TrailSelectState,
} from "./select-trail-button";
import { TrailDetailsBody } from "./trail-details-body";
import { TrailFavoriteButton } from "./trail-favorite-button";

const TEXT = "#1E1E2F";
const BUTTON_SIZE = 40;
const BUTTON_TOP = 16;
const SELECT_HEIGHT = 52;

interface TrailSheetContentProps {
    trailId: string;
    onClose: () => void;
    /** Shows the "Choisir" button, floating at the bottom. */
    onSelect?: (trail: TrailDetails) => void;
    selectState?: TrailSelectState;
    /** False while the sheet is still opening: the map starts afterwards. */
    mapReady?: boolean;
}

/**
 * White sheet body scrolling under floating buttons: favorite star top
 * left, close cross top right, and the optional "Choisir" button at the
 * bottom. Shared by the search panel and the trail screen.
 */
export function TrailSheetContent({
    trailId,
    onClose,
    onSelect,
    selectState = "available",
    mapReady = true,
}: TrailSheetContentProps) {
    const insets = useSafeAreaInsets();
    const trail = useTrailDetails(trailId);
    const { isFavorite, toggleFavorite } = useFavoriteTrail(trailId);
    const selectBottom = insets.bottom + 12;
    const showSelect = trail !== undefined && onSelect !== undefined;

    return (
        <View style={styles.sheet}>
            <ScrollView
                contentContainerStyle={[
                    styles.content,
                    {
                        paddingBottom: showSelect
                            ? selectBottom + SELECT_HEIGHT + 24
                            : insets.bottom + 24,
                    },
                ]}
            >
                {trail ? (
                    <TrailDetailsBody trail={trail} showMap={mapReady} />
                ) : (
                    <Text style={styles.missing}>Sentier introuvable.</Text>
                )}
            </ScrollView>

            {trail && (
                <TrailFavoriteButton
                    isFavorite={isFavorite}
                    onPress={toggleFavorite}
                    style={[styles.floating, styles.left]}
                />
            )}
            <Pressable
                onPress={onClose}
                accessibilityRole="button"
                accessibilityLabel="Fermer"
                hitSlop={6}
                style={({ pressed }) => [
                    styles.floating,
                    styles.right,
                    pressed && styles.pressed,
                ]}
            >
                <Icon ios="xmark" material="close" size={16} color={TEXT} />
            </Pressable>

            {showSelect && (
                <View style={[styles.select, { bottom: selectBottom }]}>
                    <SelectTrailButton
                        state={selectState}
                        onPress={() => onSelect(trail)}
                    />
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    sheet: { flex: 1, backgroundColor: "#FFFFFF" },
    content: {
        paddingTop: BUTTON_TOP + BUTTON_SIZE + 12,
        paddingHorizontal: 16,
    },
    missing: {
        marginTop: 48,
        textAlign: "center",
        fontSize: 15,
        color: "rgba(30, 30, 47, 0.55)",
    },
    // Round buttons hovering over the text as it scrolls under them.
    floating: {
        position: "absolute",
        top: BUTTON_TOP,
        width: BUTTON_SIZE,
        height: BUTTON_SIZE,
        borderRadius: BUTTON_SIZE / 2,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#FFFFFF",
        boxShadow: "0px 2px 10px rgba(20, 20, 40, 0.16)",
    },
    left: { left: 16 },
    right: { right: 16 },
    pressed: { opacity: 0.6 },
    select: {
        position: "absolute",
        left: 16,
        right: 16,
        borderRadius: SELECT_HEIGHT / 2,
        boxShadow: "0px 6px 18px rgba(20, 20, 40, 0.22)",
    },
});
