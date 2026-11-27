import { Image } from "expo-image";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { usePressed } from "@/hooks/use-pressed";
import { useThemeColors } from "@/hooks/use-theme-colors";

import type { PointOfInterest } from "../types";

interface PointOfInterestCardProps {
    point: PointOfInterest;
    /** Opens the photo in large. */
    onPressPhoto: () => void;
}

/** Title and description of a point of interest, its photo on the right. */
export function PointOfInterestCard({
    point,
    onPressPhoto,
}: PointOfInterestCardProps) {
    const colors = useThemeColors();
    const { pressed, pressHandlers } = usePressed();
    return (
        <View
            style={[styles.card, { backgroundColor: colors["surface-muted"] }]}
        >
            <View style={styles.text}>
                <Text
                    style={[styles.title, { color: colors.foreground }]}
                    numberOfLines={1}
                >
                    {point.title}
                </Text>
                <Text
                    style={[
                        styles.description,
                        { color: colors["foreground-muted"] },
                    ]}
                    numberOfLines={2}
                >
                    {point.description}
                </Text>
            </View>
            <Pressable
                onPress={onPressPhoto}
                {...pressHandlers}
                accessibilityRole="imagebutton"
                accessibilityLabel={`Agrandir la photo : ${point.title}`}
                style={pressed && styles.pressed}
            >
                <Image
                    source={{ uri: point.photo.url }}
                    style={[
                        styles.photo,
                        { backgroundColor: colors.placeholder },
                    ]}
                    contentFit="cover"
                    transition={200}
                />
            </Pressable>
        </View>
    );
}

const styles = StyleSheet.create({
    card: {
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
        padding: 10,
        borderRadius: 16,
    },
    text: { flex: 1, gap: 2 },
    title: { fontSize: 14, fontWeight: "600" },
    description: { fontSize: 13, lineHeight: 18 },
    pressed: { opacity: 0.8 },
    photo: {
        width: 60,
        height: 60,
        borderRadius: 12,
    },
});
