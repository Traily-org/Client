import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import { useEffect } from "react";
import { StyleSheet, Text, View } from "react-native";
import Animated, {
    cancelAnimation,
    FadeInDown,
    useAnimatedStyle,
    useReducedMotion,
    useSharedValue,
    withRepeat,
    withSequence,
    withTiming,
    ZoomIn,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { GlassButton } from "@/components/glass-button";
import { ON_GLASS } from "@/components/glass-surface";
import { Icon } from "@/components/icon";
import { EASE_OUT, ENTER_DURATION } from "@/constants/motion";

import { useHikeSession } from "../hooks/use-hike-session";
import { startHike } from "../services/hike-session";

const ROUND_SIZE = 76;
// Same orange as the route and the trailhead marker on the map.
const ACCENT = "#E0733F";
const PULSE_MS = 1600;

interface HikeActionBarProps {
    /** Height of the map's corner buttons, to center the round button on. */
    cornerButtonSize: number;
}

/**
 * Hike action at the bottom center of the map, between the corner buttons:
 * start once a trail is picked, then photo once the hike runs. Ending the
 * hike is in its details (HikeStatusCard).
 */
export function HikeActionBar({ cornerButtonSize }: HikeActionBarProps) {
    const insets = useSafeAreaInsets();
    const router = useRouter();
    const session = useHikeSession();

    if (session.status === "idle" && !session.trail) return null;

    // Centered on the corner buttons' content.
    const bottom = insets.bottom + (cornerButtonSize - ROUND_SIZE) / 2;

    return (
        <View style={[styles.bar, { bottom }]}>
            {session.status === "idle" ? (
                <StartButton onPress={() => startHike()} />
            ) : (
                <PhotoButton onPress={() => router.push("/capture")} />
            )}
        </View>
    );
}

/** Orange glass button that breathes, with a halo pulsing around it. */
function StartButton({ onPress }: { onPress: () => void }) {
    const reducedMotion = useReducedMotion();
    const pulse = useSharedValue(0);
    const breath = useSharedValue(1);

    useEffect(() => {
        if (reducedMotion) return;
        pulse.set(
            withRepeat(
                withTiming(1, { duration: PULSE_MS, easing: EASE_OUT }),
                -1,
            ),
        );
        breath.set(
            withRepeat(
                withSequence(
                    withTiming(1.05, { duration: PULSE_MS / 2 }),
                    withTiming(1, { duration: PULSE_MS / 2 }),
                ),
                -1,
            ),
        );
        return () => {
            cancelAnimation(pulse);
            cancelAnimation(breath);
        };
    }, [reducedMotion, pulse, breath]);

    const haloStyle = useAnimatedStyle(() => ({
        opacity: 0.55 * (1 - pulse.get()),
        transform: [{ scale: 1 + 0.45 * pulse.get() }],
    }));
    const breathStyle = useAnimatedStyle(() => ({
        transform: [{ scale: breath.get() }],
    }));

    return (
        <Animated.View
            entering={FadeInDown.duration(ENTER_DURATION).delay(110)}
        >
            {!reducedMotion && (
                <Animated.View style={[styles.halo, haloStyle]} />
            )}
            <Animated.View style={breathStyle}>
                <GlassButton
                    accessibilityLabel="Démarrer la randonnée"
                    radius={ROUND_SIZE / 2}
                    pressedScale={0.9}
                    haptic={Haptics.ImpactFeedbackStyle.Medium}
                    tint={ACCENT}
                    onPress={onPress}
                    style={styles.round}
                >
                    <Icon
                        ios="figure.hiking"
                        material="hiking"
                        size={28}
                        color="white"
                    />
                    <Text style={[styles.roundLabel, { color: "white" }]}>
                        Démarrer
                    </Text>
                </GlassButton>
            </Animated.View>
        </Animated.View>
    );
}

/** Round glass button, in the style of the corner buttons around it. */
function PhotoButton({ onPress }: { onPress: () => void }) {
    return (
        // Démarrer goes at once on press (no exit animation, which also
        // jumped on the web): Photo grows in its place, never next to it.
        <Animated.View entering={ZoomIn.duration(ENTER_DURATION)}>
            <GlassButton
                accessibilityLabel="Prendre une photo"
                radius={ROUND_SIZE / 2}
                pressedScale={0.9}
                haptic={Haptics.ImpactFeedbackStyle.Medium}
                onPress={onPress}
                style={styles.round}
            >
                <Icon
                    ios="camera.fill"
                    material="photo_camera"
                    size={28}
                    color={ON_GLASS}
                />
                <Text style={[styles.roundLabel, { color: ON_GLASS }]}>
                    Photo
                </Text>
            </GlassButton>
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    // Full width to center the buttons, but lets touches through to the
    // corner buttons on each side.
    bar: {
        position: "absolute",
        left: 0,
        right: 0,
        alignItems: "center",
        pointerEvents: "box-none",
    },
    round: {
        width: ROUND_SIZE,
        height: ROUND_SIZE,
        alignItems: "center",
        justifyContent: "center",
        gap: 2,
    },
    roundLabel: { fontSize: 12, fontWeight: "600" },
    halo: {
        ...StyleSheet.absoluteFill,
        borderRadius: ROUND_SIZE / 2,
        backgroundColor: ACCENT,
    },
});
