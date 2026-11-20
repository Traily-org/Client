import { Image } from "expo-image";
import { Pressable, StyleSheet, Text, View } from "react-native";
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withTiming,
} from "react-native-reanimated";

import { Icon } from "@/components/icon";
import { PRESS_IN, PRESS_OUT } from "@/constants/motion";

import { formatDistance, formatDuration } from "../services/trail-format";
import type { Trail } from "../types";
import { DIFFICULTY } from "./trail-difficulty";
import { TrailSketch } from "./trail-sketch";

const TEXT = "#1E1E2F";
const MUTED = "rgba(30, 30, 47, 0.55)";
const SKETCH_COLOR = "#E0733F";

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
                {/* The icon shows until the photo has loaded. */}
                <View
                    style={[styles.cover, { backgroundColor: difficulty.tint }]}
                >
                    <Icon
                        ios="mountain.2.fill"
                        material="landscape"
                        size={30}
                        color={difficulty.color}
                    />
                    <Image
                        source={{ uri: trail.cover.url }}
                        style={StyleSheet.absoluteFill}
                        contentFit="cover"
                        transition={200}
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
        overflow: "hidden",
        alignItems: "center",
        justifyContent: "center",
    },
    body: { flex: 1, gap: 3 },
    name: { fontSize: 15, fontWeight: "600", color: TEXT },
    location: { fontSize: 13, color: MUTED },
    figures: { fontSize: 12, color: MUTED },
});
