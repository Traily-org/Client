import { useEffect, useEffectEvent, useState } from "react";
import {
    BackHandler,
    PanResponder,
    StyleSheet,
    useWindowDimensions,
    View,
} from "react-native";
import Animated, {
    clamp,
    interpolate,
    type SharedValue,
    useAnimatedReaction,
    useAnimatedStyle,
    useSharedValue,
    withTiming,
} from "react-native-reanimated";
import { scheduleOnRN } from "react-native-worklets";

import { SHEET_CLOSE, SHEET_OPEN, TRANSITION } from "@/constants/motion";

import type { TrailDetails } from "../types";
import type { TrailSelectState } from "./select-trail-button";
import { TrailSheetContent } from "./trail-sheet-content";

const TOP_RADIUS = 28;
/** Keeps the drag area clear of the floating star and cross. */
const HANDLE_INSET = 72;

/** Pulled down further than this, or flicked faster (px/ms), it closes. */
const DISMISS_DISTANCE = 120;
const DISMISS_VELOCITY = 0.9;

interface TrailSheetPanelProps {
    trailId: string;
    /** Slides the panel out, e.g. when the search field gets the focus. */
    closeRequested?: boolean;
    selectState: TrailSelectState;
    onSelect: (trail: TrailDetails) => void;
    /** Called once the panel has slid out, to unmount it. */
    onDismissed: () => void;
    /**
     * Mirrors how far the panel is open, 0 to 1, finger pull included: lets
     * the search bar fade its back arrow in step.
     */
    openness?: SharedValue<number>;
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
    openness,
}: TrailSheetPanelProps) {
    const { height } = useWindowDimensions();
    // 0 = below the screen, 1 = open. `drag` adds the finger's pull on top.
    const progress = useSharedValue(0);
    const drag = useSharedValue(0);
    // The route map is heavy to start: it waits for the end of the opening,
    // so the panel moves on the very first frames.
    const [opened, setOpened] = useState(false);

    useEffect(() => {
        progress.set(
            withTiming(1, SHEET_OPEN, (finished) => {
                if (finished) scheduleOnRN(setOpened, true);
            }),
        );
    }, [progress]);

    useAnimatedReaction(
        () => clamp(progress.get() - drag.get() / height, 0, 1),
        (value) => openness?.set(value),
    );
    // Unmounted with the search results while still open: give the arrow back.
    useEffect(() => () => openness?.set(0), [openness]);

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
            // The handle holds no button: it takes the touch right away and
            // keeps it, even once the finger (or mouse, on the web) has left
            // its thin strip.
            onStartShouldSetPanResponder: () => true,
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
            {/* Reaches a screen height up, behind the search bar, so its edge
                never shows around the panel's rounded corners. The search
                panel clips it at the top of the screen. */}
            <Animated.View
                style={[styles.backdrop, { top: -height }, backdropStyle]}
            />
            <Animated.View style={[styles.panel, panelStyle]}>
                <TrailSheetContent
                    trailId={trailId}
                    onClose={dismiss}
                    onSelect={onSelect}
                    selectState={selectState}
                    mapReady={opened}
                />
                {/* Drag area around the bar, between the floating buttons. */}
                <View style={styles.handle} {...pullDown.panHandlers}>
                    <View style={styles.grabber} />
                </View>
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
        backgroundColor: "#FFFFFF",
        boxShadow: "0px -8px 28px rgba(20, 20, 40, 0.18)",
    },
    handle: {
        position: "absolute",
        top: 0,
        left: HANDLE_INSET,
        right: HANDLE_INSET,
        height: 36,
        alignItems: "center",
    },
    grabber: {
        marginTop: 8,
        width: 40,
        height: 5,
        borderRadius: 2.5,
        backgroundColor: "rgba(30, 30, 47, 0.25)",
    },
});
