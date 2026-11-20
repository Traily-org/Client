import type { MapHike } from "../types";

/** Zoom the camera follows the walker at when the hike starts. */
export const FOLLOW_ZOOM = 16;
/** Zoom range while the hike runs: from a neighborhood to the path. */
export const FOLLOW_MIN_ZOOM = 14;
export const FOLLOW_MAX_ZOOM = 18;
/**
 * MapLibre's own max zoom, given back explicitly once the hike stops
 * running: an unset max may keep the last one on native.
 */
export const DEFAULT_MAX_ZOOM = 22;

/** Tilt while following, to show more of the way ahead. */
export const FOLLOW_PITCH = 45;

/**
 * Move onto the walker when following starts (start, resume, recenter), in
 * ms. The zoom range applies once it is over, so it doesn't cut it short.
 */
export const FOLLOW_ENTER_DURATION = 900;
/**
 * Move between two positions while following, in ms. As long as the
 * position updates (every second), so the camera glides without stopping.
 */
export const FOLLOW_STEP_DURATION = 1000;

/** Move framing the whole route, on pause or once the hike ends, in ms. */
export const ROUTE_FRAME_DURATION = 900;

/**
 * Share of the screen height kept clear at the top while following: the
 * walker sits at 70 % of the height, low enough to see the way ahead, above
 * the hike buttons.
 */
const FOLLOW_TOP_SHARE = 0.4;

export interface CameraPadding {
    top: number;
    right: number;
    bottom: number;
    left: number;
}

/** Camera position while following the walker. */
export interface FollowStop {
    center: [number, number];
    zoom: number;
    bearing: number;
    pitch: number;
    padding: CameraPadding;
    duration: number;
    easing: "linear" | "ease";
}

export function getFollowPadding(screenHeight: number): CameraPadding {
    return {
        top: Math.round(screenHeight * FOLLOW_TOP_SHARE),
        right: 0,
        bottom: 0,
        left: 0,
    };
}

export function clampFollowZoom(zoom: number): number {
    return Math.min(Math.max(zoom, FOLLOW_MIN_ZOOM), FOLLOW_MAX_ZOOM);
}

/**
 * Camera over the walker, map turned to their heading. Entering (start,
 * resume, recenter) eases in; then each new position glides linearly.
 */
export function getFollowStop(
    hike: MapHike,
    zoom: number,
    padding: CameraPadding,
    entering: boolean,
): FollowStop {
    return {
        center: hike.position.lngLat,
        zoom: clampFollowZoom(zoom),
        bearing: hike.position.heading,
        pitch: FOLLOW_PITCH,
        padding,
        duration: entering ? FOLLOW_ENTER_DURATION : FOLLOW_STEP_DURATION,
        easing: entering ? "ease" : "linear",
    };
}
