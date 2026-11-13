import * as Haptics from "expo-haptics";
import { Pressable, StyleSheet, Text } from "react-native";

import { Icon } from "@/components/icon";

const ACCENT = "#E0733F";
const TEXT = "#1E1E2F";

interface TrailFavoriteButtonProps {
    isFavorite: boolean;
    onPress: () => void;
}

/** "Favori" pill, filled with the accent color once the trail is saved. */
export function TrailFavoriteButton({
    isFavorite,
    onPress,
}: TrailFavoriteButtonProps) {
    return (
        <Pressable
            onPress={() => {
                void Haptics.selectionAsync();
                onPress();
            }}
            accessibilityRole="button"
            accessibilityLabel="Favori"
            accessibilityState={{ selected: isFavorite }}
            style={[styles.pill, isFavorite && styles.pillActive]}
        >
            <Icon
                ios={isFavorite ? "star.fill" : "star"}
                material="star"
                size={16}
                color={isFavorite ? "#FFFFFF" : ACCENT}
            />
            <Text style={[styles.label, isFavorite && styles.labelActive]}>
                {isFavorite ? "En favori" : "Favori"}
            </Text>
        </Pressable>
    );
}

const styles = StyleSheet.create({
    pill: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
        height: 36,
        paddingHorizontal: 14,
        borderRadius: 18,
        borderWidth: 1.5,
        borderColor: ACCENT,
        backgroundColor: "#FFFFFF",
    },
    pillActive: { backgroundColor: ACCENT },
    label: { fontSize: 14, fontWeight: "600", color: TEXT },
    labelActive: { color: "#FFFFFF" },
});
