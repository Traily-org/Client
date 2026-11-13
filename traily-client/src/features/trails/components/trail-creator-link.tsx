import { Pressable, StyleSheet, Text, View } from "react-native";

import { Icon } from "@/components/icon";

import { getInitials } from "../services/trail-format";
import type { TrailCreator } from "../types";

const TEXT = "#1E1E2F";
const MUTED = "rgba(30, 30, 47, 0.55)";

interface TrailCreatorLinkProps {
    creator: TrailCreator;
    onPress: () => void;
}

/** "Créé par" row with the creator's avatar, opening their profile. */
export function TrailCreatorLink({ creator, onPress }: TrailCreatorLinkProps) {
    return (
        <Pressable
            onPress={onPress}
            accessibilityRole="link"
            accessibilityLabel={`Créé par ${creator.name}, voir son profil`}
            style={({ pressed }) => [styles.row, pressed && styles.pressed]}
        >
            {/* TODO(api): profile photo once the API provides one. */}
            <View style={styles.avatar}>
                <Text style={styles.initials}>{getInitials(creator.name)}</Text>
            </View>
            <View style={styles.text}>
                <Text style={styles.caption}>Créé par</Text>
                <Text style={styles.name}>{creator.name}</Text>
            </View>
            <Icon
                ios="chevron.right"
                material="chevron_right"
                size={16}
                color={MUTED}
            />
        </Pressable>
    );
}

const styles = StyleSheet.create({
    row: {
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
        padding: 10,
        borderRadius: 16,
        backgroundColor: "#F6F5F2",
    },
    pressed: { opacity: 0.7 },
    avatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#2F6B4F",
    },
    initials: { fontSize: 15, fontWeight: "700", color: "#FFFFFF" },
    text: { flex: 1 },
    caption: { fontSize: 12, color: MUTED },
    name: { fontSize: 15, fontWeight: "600", color: TEXT },
});
