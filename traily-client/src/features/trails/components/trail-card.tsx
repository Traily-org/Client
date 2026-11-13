import { Pressable, StyleSheet, Text, View } from "react-native";
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withTiming,
} from "react-native-reanimated";

import { Icon } from "@/components/icon";
import { PRESS_IN, PRESS_OUT } from "@/constants/motion";

import type { Trail, TrailDifficulty } from "../types";
import { TrailSketch } from "./trail-sketch";

const TEXT = "#1E1E2F";
const MUTED = "rgba(30, 30, 47, 0.55)";
const SKETCH_COLOR = "#E0733F";

const DIFFICULTY: Record<
    TrailDifficulty,
    { label: string; color: string; tint: string }
> = {
    easy: { label: "Facile", color: "#2F8A4F", tint: "#E2F2E7" },
    medium: { label: "Moyen", color: "#B87400", tint: "#FDF0D5" },
    hard: { label: "Difficile", color: "#C2412B", tint: "#FBE2DC" },
};

function formatDistance(km: number): string {
    return `${km.toFixed(1).replace(".", ",")} km`;
}

function formatDuration(minutes: number): string {
    const hours = Math.floor(minutes / 60);
    const rest = minutes % 60;
    if (hours === 0) return `${rest} min`;
    return rest === 0
        ? `${hours} h`
        : `${hours} h ${String(rest).padStart(2, "0")}`;
}

interface TrailCardProps {
    trail: Trail;
    onPress: () => void;
}

/**
 * Horizontal trail card: cover on the left, name and key figures in the
 * middle, a sketch of the route on the right.
 */
export function TrailCard({ trail, onPress }: TrailCardProps) {
    const pressed = useSharedValue(0);
    const pressStyle = useAnimatedStyle(() => ({
        transform: [{ scale: 1 - 0.02 * pressed.get() }],
    }));
    const difficulty = DIFFICULTY[trail.difficulty];

    return (
        <Pressable
            onPress={onPress}
            onPressIn={() => pressed.set(withTiming(1, PRESS_IN))}
            onPressOut={() => pressed.set(withTiming(0, PRESS_OUT))}
            accessibilityRole="button"
            accessibilityLabel={trail.name}
        >
            <Animated.View style={[styles.card, pressStyle]}>
                {/* TODO(design): cover photo once the API provides one. */}
                <View
                    style={[styles.cover, { backgroundColor: difficulty.tint }]}
                >
                    <Icon
                        ios="mountain.2.fill"
                        material="landscape"
                        size={30}
                        color={difficulty.color}
                    />
                </View>
                <View style={styles.body}>
                    <Text style={styles.name} numberOfLines={2}>
                        {trail.name}
                    </Text>
                    <Text style={styles.location} numberOfLines={1}>
                        {trail.location}
                        <Text style={{ color: difficulty.color }}>
                            {"  ·  "}
                            {difficulty.label}
                        </Text>
                    </Text>
                    <Text style={styles.figures} numberOfLines={1}>
                        {formatDistance(trail.distanceKm)} ·{" "}
                        {trail.elevationGainM} m D+ ·{" "}
                        {formatDuration(trail.durationMin)}
                    </Text>
                </View>
                <TrailSketch
                    points={trail.sketch}
                    size={64}
                    color={SKETCH_COLOR}
                />
            </Animated.View>
        </Pressable>
    );
}

const styles = StyleSheet.create({
    card: {
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
        padding: 10,
        borderRadius: 22,
        backgroundColor: "#FFFFFF",
        boxShadow: "0px 2px 12px rgba(20, 20, 40, 0.08)",
    },
    cover: {
        width: 84,
        height: 76,
        borderRadius: 16,
        alignItems: "center",
        justifyContent: "center",
    },
    body: { flex: 1, gap: 3 },
    name: { fontSize: 15, fontWeight: "600", color: TEXT },
    location: { fontSize: 13, color: MUTED },
    figures: { fontSize: 12, color: MUTED },
});
