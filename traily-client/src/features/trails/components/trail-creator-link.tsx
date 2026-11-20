import { Pressable, StyleSheet, Text, View } from "react-native";

import { Icon } from "@/components/icon";
import { useThemeColors } from "@/hooks/use-theme-colors";

import { getInitials } from "../services/trail-format";
import type { TrailCreator } from "../types";

interface TrailCreatorLinkProps {
    creator: TrailCreator;
    onPress: () => void;
}

/** "Créé par" row with the creator's avatar, opening their profile. */
export function TrailCreatorLink({ creator, onPress }: TrailCreatorLinkProps) {
    const colors = useThemeColors();
    return (
        <Pressable
            onPress={onPress}
            accessibilityRole="link"
            accessibilityLabel={`Créé par ${creator.name}, voir son profil`}
            style={({ pressed }) => [
                styles.row,
                { backgroundColor: colors["surface-muted"] },
                pressed && styles.pressed,
            ]}
        >
            {/* TODO(api): profile photo once the API provides one. */}
            <View style={[styles.avatar, { backgroundColor: colors.avatar }]}>
                <Text style={[styles.initials, { color: colors["on-accent"] }]}>
                    {getInitials(creator.name)}
                </Text>
            </View>
            <View style={styles.text}>
                <Text
                    style={[
                        styles.caption,
                        { color: colors["foreground-muted"] },
                    ]}
                >
                    Créé par
                </Text>
                <Text style={[styles.name, { color: colors.foreground }]}>
                    {creator.name}
                </Text>
            </View>
            <Icon
                ios="chevron.right"
                material="chevron_right"
                size={16}
                color={colors["foreground-muted"]}
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
    },
    pressed: { opacity: 0.7 },
    avatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: "center",
        justifyContent: "center",
    },
    initials: { fontSize: 15, fontWeight: "700" },
    text: { flex: 1 },
    caption: { fontSize: 12 },
    name: { fontSize: 15, fontWeight: "600" },
});
