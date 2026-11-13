import { Pressable, StyleSheet, View } from "react-native";

import { Icon } from "@/components/icon";

import { useFavoriteTrail } from "../hooks/use-favorite-trail";
import { TrailFavoriteButton } from "./trail-favorite-button";

const TEXT = "#1E1E2F";
const HEIGHT = 40;
const SLOT = 44;

interface TrailSheetActionsProps {
    trailId: string;
    /** False for an unknown trail: nothing to save. */
    showFavorite: boolean;
    onClose: () => void;
}

/** Favorite star and close cross, joined in one capsule. */
export function TrailSheetActions({
    trailId,
    showFavorite,
    onClose,
}: TrailSheetActionsProps) {
    const { isFavorite, toggleFavorite } = useFavoriteTrail(trailId);

    return (
        <View style={styles.capsule}>
            {showFavorite && (
                <>
                    <TrailFavoriteButton
                        isFavorite={isFavorite}
                        onPress={toggleFavorite}
                        size={SLOT}
                    />
                    <View style={styles.separator} />
                </>
            )}
            <Pressable
                onPress={onClose}
                accessibilityRole="button"
                accessibilityLabel="Fermer"
                hitSlop={4}
                style={({ pressed }) => [
                    styles.slot,
                    pressed && styles.pressed,
                ]}
            >
                <Icon ios="xmark" material="close" size={16} color={TEXT} />
            </Pressable>
        </View>
    );
}

const styles = StyleSheet.create({
    capsule: {
        flexDirection: "row",
        alignItems: "center",
        height: HEIGHT,
        borderRadius: HEIGHT / 2,
        backgroundColor: "#FFFFFF",
        boxShadow: "0px 1px 6px rgba(20, 20, 40, 0.1)",
    },
    separator: {
        width: StyleSheet.hairlineWidth,
        height: HEIGHT - 16,
        backgroundColor: "rgba(30, 30, 47, 0.2)",
    },
    slot: {
        width: SLOT,
        height: HEIGHT,
        alignItems: "center",
        justifyContent: "center",
    },
    pressed: { opacity: 0.5 },
});
