import { useEffect, useEffectEvent, useRef, useState } from "react";
import { useWindowDimensions } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { MAP_MIN_ZOOM } from "@/constants/config";

import {
    type CameraPadding,
    clampFollowZoom,
    DEFAULT_MAX_ZOOM,
    FOLLOW_ENTER_DURATION,
    FOLLOW_MAX_ZOOM,
    FOLLOW_MIN_ZOOM,
    FOLLOW_ZOOM,
    type FollowStop,
    getFollowPadding,
    getFollowStop,
    ROUTE_FRAME_DURATION,
} from "../components/hike-camera";
import { getTrailFocusPadding } from "../components/trail-focus-camera";
import type { MapHike } from "../types";

/** Camera moves of each platform's map, for the hike camera to drive. */
export interface HikeCameraControls {
    follow: (stop: FollowStop) => void;
    /** Fits the route, north up and flat. */
    frame: (
        route: [number, number][],
        padding: CameraPadding,
        duration: number,
    ) => void;
}

interface UseHikeCameraOptions {
    hike: MapHike | undefined;
    /** Room kept for the map chrome above the bottom safe area. */
    bottomOffset: number;
    controls: HikeCameraControls;
    onStopFollowing?: () => void;
}

/**
 * Camera of the home map during a hike, shared by the native and web maps:
 * follows the walker while running, frames the whole route on pause, and
 * the route walked once the hike ends. The map reports its moves through
 * `handleMoveStart` and `handleMoveEnd`, and applies `zoomRange`.
 */
export function useHikeCamera({
    hike,
    bottomOffset,
    controls,
    onStopFollowing,
}: UseHikeCameraOptions) {
    const insets = useSafeAreaInsets();
    const { height } = useWindowDimensions();
    const active = hike !== undefined;
    const paused = hike?.paused === true;
    const running = active && !paused;
    const following = running && hike.following;
    const [lng, lat] = hike?.position.lngLat ?? [0, 0];
    const heading = hike?.position.heading ?? 0;
    const route = hike?.route;

    // Zoom to follow at: the starting one, then the last one chosen by hand
    // while running, so recentering keeps it.
    const followZoomRef = useRef(FOLLOW_ZOOM);
    const wasFollowingRef = useRef(false);
    // Route of the hike in progress, framed once it ends.
    const lastRouteRef = useRef<[number, number][] | null>(null);
    const overviewPadding = getTrailFocusPadding(insets, bottomOffset);

    // Before following: a new hike starts at the starting zoom, and the
    // effects run in order.
    const frame = useEffectEvent((frameRoute: [number, number][]) => {
        controls.frame(frameRoute, overviewPadding, ROUTE_FRAME_DURATION);
    });
    useEffect(() => {
        if (route) lastRouteRef.current = route;
    }, [route]);
    useEffect(() => {
        if (active) {
            followZoomRef.current = FOLLOW_ZOOM;
            return;
        }
        const last = lastRouteRef.current;
        lastRouteRef.current = null;
        if (last) frame(last);
    }, [active]);

    const follow = useEffectEvent((entering: boolean) => {
        if (!hike) return;
        controls.follow(
            getFollowStop(
                hike,
                followZoomRef.current,
                getFollowPadding(height),
                entering,
            ),
        );
    });
    useEffect(() => {
        if (!following) {
            wasFollowingRef.current = false;
            return;
        }
        const entering = !wasFollowingRef.current;
        wasFollowingRef.current = true;
        follow(entering);
    }, [following, lng, lat, heading]);

    const frameHikeRoute = useEffectEvent(() => {
        if (!hike) return;
        controls.frame(hike.route, overviewPadding, ROUTE_FRAME_DURATION);
    });
    // Only when the pause starts: the map is free to move meanwhile.
    useEffect(() => {
        if (paused) frameHikeRoute();
    }, [paused]);

    // The zoom range applies once the camera reached the walker: applied
    // earlier, it would jump the zoom and cut the move short.
    const [zoomLimited, setZoomLimited] = useState(false);
    useEffect(() => {
        if (!running) return;
        const timer = setTimeout(
            () => setZoomLimited(true),
            FOLLOW_ENTER_DURATION,
        );
        return () => {
            clearTimeout(timer);
            setZoomLimited(false);
        };
    }, [running]);

    return {
        zoomRange: zoomLimited
            ? { min: FOLLOW_MIN_ZOOM, max: FOLLOW_MAX_ZOOM }
            : { min: MAP_MIN_ZOOM, max: DEFAULT_MAX_ZOOM },
        /** A move starts: by hand, it stops following the walker. */
        handleMoveStart(userInteraction: boolean) {
            if (userInteraction && following) onStopFollowing?.();
        },
        /** A move ended: a zoom chosen by hand while running is kept. */
        handleMoveEnd(zoom: number, userInteraction: boolean) {
            if (running && userInteraction) {
                followZoomRef.current = clampFollowZoom(zoom);
            }
        },
    };
}
