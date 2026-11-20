import { StyleSheet, Text, View } from "react-native";

import { GlassButton } from "@/components/glass-button";
import { Icon } from "@/components/icon";

const ACCENT = "#E0733F";

/** What picking the trail would do, as seen from the hike in progress. */
export type TrailSelectState = "available" | "selected" | "locked";

const LABELS: Record<TrailSelectState, string> = {
    available: "Choisir cette randonnée",
    selected: "Randonnée choisie",
    locked: "Randonnée en cours",
};

interface SelectTrailButtonProps {
    state: TrailSelectState;
    onPress: () => void;
}

/**
 * Main action of the trail sheet, in the accent color of the Démarrer
 * button it leads to. Greyed while a hike is in progress, since its trail
 * can't change.
 */
export function SelectTrailButton({ state, onPress }: SelectTrailButtonProps) {
    const locked = state === "locked";
    const label = LABELS[state];

    if (locked) {
        return (
            <View
                style={[styles.button, styles.locked]}
                accessible
                accessibilityRole="button"
                accessibilityLabel={label}
                accessibilityState={{ disabled: true }}
            >
                <Icon
                    ios="lock.fill"
                    material="lock"
                    size={18}
                    color="rgba(30, 30, 47, 0.45)"
                />
                <Text style={[styles.label, styles.lockedLabel]}>{label}</Text>
            </View>
        );
    }

    return (
        <GlassButton
            accessibilityLabel={label}
            radius={26}
            tint={ACCENT}
            pressedScale={0.97}
            onPress={onPress}
            style={styles.button}
        >
            <Icon
                ios={state === "selected" ? "checkmark" : "figure.hiking"}
                material={state === "selected" ? "check" : "hiking"}
                size={20}
                color="#FFFFFF"
            />
            <Text style={styles.label}>{label}</Text>
        </GlassButton>
    );
}

const styles = StyleSheet.create({
    button: {
        height: 52,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
    },
    // Opaque: the button floats over the text.
    locked: {
        borderRadius: 26,
        backgroundColor: "#ECECEF",
    },
    label: { fontSize: 16, fontWeight: "700", color: "#FFFFFF" },
    lockedLabel: { color: "rgba(30, 30, 47, 0.45)" },
});
