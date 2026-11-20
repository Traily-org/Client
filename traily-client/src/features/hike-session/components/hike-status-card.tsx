import { useRouter } from "expo-router";
import type { AndroidSymbol, SFSymbol } from "expo-symbols";
import { useEffect, useState } from "react";
import {
    Pressable,
    StyleSheet,
    Text,
    View,
    type StyleProp,
    type ViewStyle,
} from "react-native";
import Animated, {
    cancelAnimation,
    FadeIn,
    FadeInUp,
    FadeOut,
    interpolate,
    LinearTransition,
    useAnimatedStyle,
    useReducedMotion,
    useSharedValue,
    withDelay,
    withRepeat,
    withTiming,
} from "react-native-reanimated";

import { GlassButton } from "@/components/glass-button";
import {
    GlassSurface,
    ON_GLASS,
    ON_GLASS_MUTED,
} from "@/components/glass-surface";
import { Icon } from "@/components/icon";
import { EASE_OUT, ENTER_DURATION } from "@/constants/motion";

import { useHikeProgress, useHikeSession } from "../hooks/use-hike-session";
import { formatDistanceKm, formatElapsed } from "../services/hike-metrics";
import {
    clearHikeTrail,
    endHike,
    pauseHike,
    resumeHike,
} from "../services/hike-session";
import type { HikeStatus } from "../types";

const EXPANDED_WIDTH = 270;
const COMPACT_HEIGHT = 40;
const STOP_WIDTH = 44;
const DANGER = "#C9391A";
const RESIZE_MS = 240;
const PULSE_MS = 1800;
/** How far the pulse ring spreads around the pill. */
const PULSE_SPREAD = 7;
// Orange of the Démarrer button: the pill pulses towards it before the start.
const ACCENT = "#E0733F";

// The time turns amber while paused, so a glance tells whether it counts.
const STATUS: Record<
    HikeStatus,
    { label: string; color: string; ios: SFSymbol; material: AndroidSymbol }
> = {
    running: {
        label: "En cours",
        color: "#2F8A4F",
        ios: "figure.walk",
        material: "directions_walk",
    },
    paused: {
        label: "En pause",
        color: "#B87400",
        ios: "pause.fill",
        material: "pause",
    },
    idle: {
        label: "Prête à partir",
        color: ON_GLASS_MUTED,
        ios: "flag.fill",
        material: "flag",
    },
};

const RESIZE = LinearTransition.duration(RESIZE_MS).easing(EASE_OUT);

/**
 * Current hike, under the search bar: time and distance in a small glass
 * pill that expands into the hike details on tap. Shown once a trail is
 * picked in the search.
 */
export function HikeStatusCard() {
    const session = useHikeSession();
    const { elapsedMs, distanceKm } = useHikeProgress(session);
    const router = useRouter();
    const [expanded, setExpanded] = useState(false);
    const [confirmingEnd, setConfirmingEnd] = useState(false);

    const trail = session.trail;
    if (!trail) return null;

    function handleEnd() {
        setConfirmingEnd(false);
        setExpanded(false);
        endHike();
        router.push("/hike-summary");
    }

    const status = STATUS[session.status];
    const time = formatElapsed(elapsedMs);
    const distance = formatDistanceKm(distanceKm);

    const summary = `Randonnée ${status.label.toLowerCase()}, ${time}, ${distance}`;

    // Expanded, the card is a plain glass pane rather than one big button:
    // its header collapses it and the actions are buttons of their own.
    return (
        <>
            {/* Invisible layer behind the open card: a tap anywhere else
                folds it back. */}
            {expanded && (
                <Pressable
                    onPress={() => {
                        setExpanded(false);
                        setConfirmingEnd(false);
                    }}
                    accessible={false}
                    importantForAccessibility="no"
                    style={StyleSheet.absoluteFill}
                />
            )}
            <Animated.View
                entering={FadeInUp.duration(ENTER_DURATION)}
                exiting={FadeOut.duration(RESIZE_MS)}
                layout={RESIZE}
            >
                {expanded ? (
                    <Animated.View
                        entering={FadeIn.duration(RESIZE_MS)}
                        style={styles.expanded}
                    >
                        <GlassSurface
                            style={[
                                StyleSheet.absoluteFill,
                                styles.expandedRadius,
                            ]}
                        />
                        <Pressable
                            accessibilityRole="button"
                            accessibilityLabel={`${summary}. Masquer les détails`}
                            onPress={() => {
                                setExpanded(false);
                                setConfirmingEnd(false);
                            }}
                            style={styles.header}
                        >
                            <Icon
                                ios={status.ios}
                                material={status.material}
                                size={18}
                                color={status.color}
                            />
                            <Text style={styles.title} numberOfLines={2}>
                                {trail.name}
                            </Text>
                            <Icon
                                ios="chevron.up"
                                material="expand_less"
                                size={16}
                                color={ON_GLASS_MUTED}
                            />
                        </Pressable>
                        <Text style={[styles.status, { color: status.color }]}>
                            {status.label}
                        </Text>

                        <View style={styles.stats}>
                            <Stat
                                label="Temps"
                                value={time}
                                color={status.color}
                            />
                            <Stat label="Parcouru" value={distance} />
                            <Stat
                                label="Restant"
                                value={formatDistanceKm(
                                    trail.distanceKm - distanceKm,
                                )}
                            />
                        </View>

                        <View style={styles.track}>
                            <View
                                style={[
                                    styles.progress,
                                    {
                                        width: `${(distanceKm / trail.distanceKm) * 100}%`,
                                        backgroundColor: status.color,
                                    },
                                ]}
                            />
                        </View>
                        <Text style={styles.note}>
                            Parcours : {formatDistanceKm(trail.distanceKm)} ·{" "}
                            {trail.elevationGainM} m D+
                        </Text>

                        {session.status !== "idle" &&
                            (confirmingEnd ? (
                                <Animated.View
                                    entering={FadeIn.duration(RESIZE_MS)}
                                    style={styles.confirm}
                                >
                                    <Text style={styles.confirmText}>
                                        Terminer la randonnée ?
                                    </Text>
                                    <View style={styles.actionRow}>
                                        <ActionButton
                                            label="Annuler"
                                            onPress={() =>
                                                setConfirmingEnd(false)
                                            }
                                            style={styles.grow}
                                        />
                                        <ActionButton
                                            label="Terminer"
                                            tone="danger"
                                            onPress={handleEnd}
                                            style={styles.grow}
                                        />
                                    </View>
                                </Animated.View>
                            ) : (
                                // Stop joined to the end of the pause button.
                                <View style={styles.joinedRow}>
                                    <ActionButton
                                        label={
                                            session.status === "running"
                                                ? "Pause"
                                                : "Reprendre"
                                        }
                                        onPress={() =>
                                            session.status === "running"
                                                ? pauseHike()
                                                : resumeHike()
                                        }
                                        style={[
                                            styles.grow,
                                            styles.joinedStart,
                                        ]}
                                    />
                                    <Pressable
                                        accessibilityRole="button"
                                        accessibilityLabel="Terminer la randonnée"
                                        onPress={() => setConfirmingEnd(true)}
                                        style={({ pressed }) => [
                                            styles.action,
                                            styles.stop,
                                            pressed && styles.actionPressed,
                                        ]}
                                    >
                                        <View style={styles.stopSquare} />
                                    </Pressable>
                                </View>
                            ))}
                        {session.status === "idle" && (
                            <>
                                <Text style={styles.note}>
                                    Appuie sur Démarrer pour lancer le chrono.
                                </Text>
                                <ActionButton
                                    label="Retirer ce sentier"
                                    onPress={clearHikeTrail}
                                />
                            </>
                        )}
                        {/* TODO(gps): drop once the distance comes from the GPS. */}
                        <Text style={styles.note}>
                            Distance estimée, GPS à venir.
                        </Text>
                    </Animated.View>
                ) : (
                    <View>
                        {/* Still while paused: nothing is going on. */}
                        {session.status !== "paused" && (
                            <PillPulse
                                color={
                                    session.status === "idle"
                                        ? ACCENT
                                        : status.color
                                }
                            />
                        )}
                        <GlassButton
                            accessibilityLabel={`${summary}. Afficher les détails`}
                            radius={COMPACT_HEIGHT / 2}
                            pressedScale={0.94}
                            transformOrigin="left top"
                            onPress={() => setExpanded(true)}
                            style={styles.compact}
                        >
                            <Animated.View
                                entering={FadeIn.duration(RESIZE_MS)}
                                style={styles.summary}
                            >
                                <Icon
                                    ios={status.ios}
                                    material={status.material}
                                    size={16}
                                    color={status.color}
                                />
                                <Text
                                    style={[
                                        styles.time,
                                        { color: status.color },
                                    ]}
                                >
                                    {time}
                                </Text>
                                <Text style={styles.separator}>·</Text>
                                <Text style={styles.distance}>{distance}</Text>
                            </Animated.View>
                        </GlassButton>
                    </View>
                )}
            </Animated.View>
        </>
    );
}

/**
 * Thin ring in the hike's color that spreads out from the compact pill and
 * fades, now and then, to catch the eye. Its edges move out rather than
 * scaling, so the gap stays even around the long pill.
 */
function PillPulse({ color }: { color: string }) {
    const reducedMotion = useReducedMotion();
    const pulse = useSharedValue(0);

    useEffect(() => {
        if (reducedMotion) return;
        pulse.set(
            withRepeat(
                withDelay(
                    PULSE_MS / 2,
                    withTiming(1, { duration: PULSE_MS, easing: EASE_OUT }),
                ),
                -1,
            ),
        );
        return () => cancelAnimation(pulse);
    }, [reducedMotion, pulse]);

    const ringStyle = useAnimatedStyle(() => {
        const inset = -PULSE_SPREAD * pulse.get();
        return {
            top: inset,
            right: inset,
            bottom: inset,
            left: inset,
            borderRadius: COMPACT_HEIGHT / 2 - inset,
            // Invisible at rest, between two waves.
            opacity: interpolate(pulse.get(), [0, 0.15, 1], [0, 0.6, 0]),
        };
    });

    if (reducedMotion) return null;
    return (
        <Animated.View
            style={[styles.pulse, { borderColor: color }, ringStyle]}
        />
    );
}

function Stat({
    label,
    value,
    color = ON_GLASS,
}: {
    label: string;
    value: string;
    color?: string;
}) {
    return (
        <View style={styles.stat}>
            <Text style={styles.statLabel}>{label}</Text>
            <Text style={[styles.statValue, { color }]}>{value}</Text>
        </View>
    );
}

function ActionButton({
    label,
    tone = "default",
    style,
    onPress,
}: {
    label: string;
    tone?: "default" | "danger";
    style?: StyleProp<ViewStyle>;
    onPress: () => void;
}) {
    const danger = tone === "danger";
    return (
        <Pressable
            accessibilityRole="button"
            onPress={onPress}
            style={({ pressed }) => [
                styles.action,
                danger && styles.dangerAction,
                pressed &&
                    (danger ? styles.dangerPressed : styles.actionPressed),
                style,
            ]}
        >
            <Text style={[styles.actionLabel, danger && styles.dangerLabel]}>
                {label}
            </Text>
        </Pressable>
    );
}

const styles = StyleSheet.create({
    pulse: {
        position: "absolute",
        borderWidth: 1.5,
        pointerEvents: "none",
    },
    compact: {
        height: COMPACT_HEIGHT,
        paddingHorizontal: 14,
        justifyContent: "center",
    },
    expanded: {
        width: EXPANDED_WIDTH,
        padding: 14,
        gap: 10,
    },
    expandedRadius: { borderRadius: 24 },
    summary: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
    },
    time: {
        fontSize: 15,
        fontWeight: "700",
        fontVariant: ["tabular-nums"],
    },
    separator: { fontSize: 15, color: ON_GLASS_MUTED },
    distance: {
        fontSize: 15,
        fontWeight: "600",
        color: ON_GLASS,
        fontVariant: ["tabular-nums"],
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
    },
    title: {
        flex: 1,
        fontSize: 15,
        fontWeight: "700",
        color: ON_GLASS,
    },
    status: { fontSize: 12, fontWeight: "600", marginTop: -6 },
    stats: { flexDirection: "row", gap: 16 },
    stat: { gap: 2 },
    statLabel: { fontSize: 11, color: ON_GLASS_MUTED },
    statValue: {
        fontSize: 17,
        fontWeight: "700",
        fontVariant: ["tabular-nums"],
    },
    track: {
        height: 4,
        borderRadius: 2,
        backgroundColor: "rgba(30, 30, 47, 0.1)",
        overflow: "hidden",
    },
    progress: { height: 4, borderRadius: 2 },
    note: { fontSize: 11, color: ON_GLASS_MUTED },
    action: {
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: 8,
        borderRadius: 12,
        backgroundColor: "rgba(30, 30, 47, 0.08)",
    },
    actionPressed: { backgroundColor: "rgba(30, 30, 47, 0.16)" },
    actionLabel: { fontSize: 14, fontWeight: "600", color: ON_GLASS },
    dangerAction: { backgroundColor: "rgba(201, 57, 26, 0.12)" },
    dangerPressed: { backgroundColor: "rgba(201, 57, 26, 0.22)" },
    dangerLabel: { color: DANGER },
    grow: { flex: 1 },
    actionRow: { flexDirection: "row", gap: 8 },
    joinedRow: { flexDirection: "row", gap: 2 },
    joinedStart: { borderTopRightRadius: 4, borderBottomRightRadius: 4 },
    stop: {
        width: STOP_WIDTH,
        borderTopLeftRadius: 4,
        borderBottomLeftRadius: 4,
    },
    stopSquare: {
        width: 12,
        height: 12,
        borderRadius: 2,
        backgroundColor: DANGER,
    },
    confirm: { gap: 8 },
    confirmText: { fontSize: 13, fontWeight: "600", color: ON_GLASS },
});
