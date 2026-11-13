import { useEffect, useEffectEvent, useState } from "react";
import {
    BackHandler,
    PanResponder,
    ScrollView,
    StyleSheet,
    Text,
    useWindowDimensions,
    View,
} from "react-native";
import Animated, {
    interpolate,
    useAnimatedStyle,
    useSharedValue,
    withTiming,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { scheduleOnRN } from "react-native-worklets";

import { SHEET_CLOSE, SHEET_OPEN, TRANSITION } from "@/constants/motion";

import { useTrailDetails } from "../hooks/use-trail-details";
import type { TrailDetails } from "../types";
import {
    SelectTrailButton,
    type TrailSelectState,
} from "./select-trail-button";
import { TrailDetailsCard } from "./trail-details-card";
import { TrailSheetActions } from "./trail-sheet-actions";

export const TRAIL_SHEET_BACKGROUND = "#F2F1EE";
const TOP_RADIUS = 28;

/** Pulled down further than this, or flicked faster (px/ms), it closes. */
const DISMISS_DISTANCE = 120;
const DISMISS_VELOCITY = 0.9;
/** Vertical travel before the bar takes the touch from the buttons on it. */
const DRAG_THRESHOLD = 8;

interface TrailSheetPanelProps {
    trailId: string;
    /** Slides the panel out, e.g. when the search field gets the focus. */
    closeRequested?: boolean;
    selectState: TrailSelectState;
    onSelect: (trail: TrailDetails) => void;
    /** Called once the panel has slid out, to unmount it. */
    onDismissed: () => void;
}

/**
 * Trail sheet rising from the bottom over the search results, like the
 * search panel itself. Closing it (cross, pulling the bar at the top down,
 * focusing the search field, Android back button) slides it out and
 * uncovers the results again.
 */
export function TrailSheetPanel({
    trailId,
    closeRequested = false,
    selectState,
    onSelect,
    onDismissed,
}: TrailSheetPanelProps) {
    const { height } = useWindowDimensions();
    const insets = useSafeAreaInsets();
    const trail = useTrailDetails(trailId);
    // 0 = below the screen, 1 = open. `drag` adds the finger's pull on top.
    const progress = useSharedValue(0);
    const drag = useSharedValue(0);

    useEffect(() => {
        progress.set(withTiming(1, SHEET_OPEN));
    }, [progress]);

    function dismiss() {
        progress.set(
            withTiming(0, SHEET_CLOSE, (finished) => {
                if (finished) scheduleOnRN(onDismissed);
            }),
        );
    }

    const onCloseRequested = useEffectEvent(dismiss);
    useEffect(() => {
        if (closeRequested) onCloseRequested();
    }, [closeRequested]);

    // Android back button closes the sheet before the search.
    useEffect(() => {
        const subscription = BackHandler.addEventListener(
            "hardwareBackPress",
            () => {
                onCloseRequested();
                return true;
            },
        );
        return () => subscription.remove();
    }, []);

    // React Native's responder system rather than a gesture handler: on the
    // web, the latter swallowed the end of the drag, so the next tap on a
    // trail card only ended that stale gesture.
    const [pullDown] = useState(() =>
        PanResponder.create({
            onMoveShouldSetPanResponder: (_, gesture) =>
                Math.abs(gesture.dy) > DRAG_THRESHOLD &&
                Math.abs(gesture.dy) > Math.abs(gesture.dx),
            onPanResponderTerminationRequest: () => false,
            onPanResponderMove: (_, gesture) => {
                drag.set(Math.max(0, gesture.dy));
            },
            onPanResponderRelease: (_, gesture) => {
                if (
                    gesture.dy > DISMISS_DISTANCE ||
                    gesture.vy > DISMISS_VELOCITY
                ) {
                    dismiss();
                } else {
                    drag.set(withTiming(0, TRANSITION));
                }
            },
            onPanResponderTerminate: () => {
                drag.set(withTiming(0, TRANSITION));
            },
        }),
    );

    const panelStyle = useAnimatedStyle(() => ({
        transform: [
            {
                translateY:
                    interpolate(progress.get(), [0, 1], [height, 0]) +
                    drag.get(),
            },
        ],
    }));
    const backdropStyle = useAnimatedStyle(() => ({
        opacity: progress.get(),
    }));

    return (
        <>
            <Animated.View style={[styles.backdrop, backdropStyle]} />
            <Animated.View style={[styles.panel, panelStyle]}>
                {/* The whole strip drags, the bar shows where. */}
                <View style={styles.handleZone} {...pullDown.panHandlers}>
                    <View style={styles.grabber} />
                    <View style={styles.actions}>
                        <TrailSheetActions
                            trailId={trailId}
                            showFavorite={trail !== undefined}
                            onClose={dismiss}
                        />
                    </View>
                </View>
                <ScrollView
                    style={styles.scroll}
                    contentContainerStyle={styles.content}
                >
                    {trail ? (
                        <TrailDetailsCard trail={trail} />
                    ) : (
                        <Text style={styles.missing}>Sentier introuvable.</Text>
                    )}
                </ScrollView>
                {trail && (
                    <View
                        style={[
                            styles.footer,
                            { paddingBottom: insets.bottom + 12 },
                        ]}
                    >
                        <SelectTrailButton
                            state={selectState}
                            onPress={() => onSelect(trail)}
                        />
                    </View>
                )}
            </Animated.View>
        </>
    );
}

const styles = StyleSheet.create({
    backdrop: {
        ...StyleSheet.absoluteFill,
        backgroundColor: "rgba(20, 20, 40, 0.2)",
    },
    panel: {
        ...StyleSheet.absoluteFill,
        overflow: "hidden",
        borderTopLeftRadius: TOP_RADIUS,
        borderTopRightRadius: TOP_RADIUS,
        backgroundColor: TRAIL_SHEET_BACKGROUND,
        boxShadow: "0px -8px 28px rgba(20, 20, 40, 0.18)",
    },
    handleZone: { height: 60 },
    actions: { position: "absolute", top: 10, right: 16 },
    grabber: {
        alignSelf: "center",
        marginTop: 8,
        width: 40,
        height: 5,
        borderRadius: 2.5,
        backgroundColor: "rgba(30, 30, 47, 0.25)",
    },
    scroll: { flex: 1 },
    content: { paddingHorizontal: 16, paddingBottom: 16 },
    missing: {
        marginTop: 48,
        textAlign: "center",
        fontSize: 15,
        color: "rgba(30, 30, 47, 0.55)",
    },
    footer: {
        paddingTop: 12,
        paddingHorizontal: 16,
        borderTopWidth: StyleSheet.hairlineWidth,
        borderTopColor: "rgba(30, 30, 47, 0.15)",
        backgroundColor: TRAIL_SHEET_BACKGROUND,
    },
});
