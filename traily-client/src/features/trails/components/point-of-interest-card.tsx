import { Image } from "expo-image";
import { StyleSheet, Text, View } from "react-native";

import type { PointOfInterest } from "../types";

const TEXT = "#1E1E2F";
const MUTED = "rgba(30, 30, 47, 0.55)";

interface PointOfInterestCardProps {
    point: PointOfInterest;
}

/** Title and description of a point of interest, its photo on the right. */
export function PointOfInterestCard({ point }: PointOfInterestCardProps) {
    return (
        <View style={styles.card}>
            <View style={styles.text}>
                <Text style={styles.title} numberOfLines={1}>
                    {point.title}
                </Text>
                <Text style={styles.description} numberOfLines={2}>
                    {point.description}
                </Text>
            </View>
            <Image
                source={{ uri: point.photo.url }}
                style={styles.photo}
                contentFit="cover"
                transition={200}
                accessibilityLabel={`Photo : ${point.title}`}
            />
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
        backgroundColor: "#F6F5F2",
    },
    text: { flex: 1, gap: 2 },
    title: { fontSize: 14, fontWeight: "600", color: TEXT },
    description: { fontSize: 13, lineHeight: 18, color: MUTED },
    photo: {
        width: 60,
        height: 60,
        borderRadius: 12,
        backgroundColor: "#E6E6EA",
    },
});
