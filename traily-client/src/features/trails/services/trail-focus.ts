import {
    type Bounds,
    lineCrossesBounds,
    padBounds,
    type Viewport,
} from "@/utils/bounds";

import type { TrailRoute } from "../types";

/**
 * Zoom from which a trail can take the focus on its own: about 5 km across
 * a phone screen, so the user is looking at a trail, not at the area.
 */
export const ZOOM_FOCUS_MIN_ZOOM = 13.5;

/**
 * A focus taken by zooming lasts until zooming back out past this level.
 * Lower than the level that gives it, so it doesn't flicker around it.
 */
export const ZOOM_FOCUS_KEEP_ZOOM = 12.5;

/**
 * Part of the screen a trail must cross to take the focus by zooming: its
 * middle 40 %, in width and height (each side shrinks by 30 %).
 */
const CENTER_SHRINK = 0.3;

/**
 * How a trail got the focus: zooming in on it (the map stays where the user
 * put it) or a touch or long press on it (the map frames the trail).
 */
export type TrailFocusSource = "zoom" | "press";

export interface TrailFocus {
    trailId: string;
    source: TrailFocusSource;
}

export interface TrailFocusState {
    focus: TrailFocus | null;
    /**
     * Trail whose preview the user closed: zooming doesn't bring it back
     * until the map zooms out or moves away from it.
     */
    dismissedId: string | null;
}

export const NO_FOCUS: TrailFocusState = { focus: null, dismissedId: null };

function isOnScreen(
    trails: TrailRoute[],
    trailId: string,
    screen: Bounds,
): boolean {
    const trail = trails.find((candidate) => candidate.id === trailId);
    return trail !== undefined && lineCrossesBounds(trail.route, screen);
}

/**
 * Trail the user zoomed in on: close enough, and the only one crossing the
 * middle of the screen. Null when zoomed out or when it is ambiguous.
 */
export function pickZoomFocus(
    viewport: Viewport,
    trails: TrailRoute[],
): string | null {
    if (viewport.zoom < ZOOM_FOCUS_MIN_ZOOM) return null;
    const center = padBounds(viewport.bounds, -CENTER_SHRINK);
    const crossing = trails.filter((trail) =>
        lineCrossesBounds(trail.route, center),
    );
    return crossing.length === 1 ? crossing[0].id : null;
}

/**
 * Focus once the map settled on `viewport`. A focused trail that left the
 * screen loses it; a zoom focus also loses it when zooming back out. A
 * focus given by a press is never replaced by zooming while its trail is on
 * screen. `zoomFocus` false turns zoom focusing off (e.g. during a hike).
 */
export function focusAfterViewport(
    state: TrailFocusState,
    viewport: Viewport,
    trails: TrailRoute[],
    zoomFocus = true,
): TrailFocusState {
    let { focus, dismissedId } = state;
    const zoomedOut = viewport.zoom < ZOOM_FOCUS_KEEP_ZOOM;

    if (
        dismissedId &&
        (zoomedOut || !isOnScreen(trails, dismissedId, viewport.bounds))
    ) {
        dismissedId = null;
    }
    if (focus && !isOnScreen(trails, focus.trailId, viewport.bounds)) {
        focus = null;
    }
    if (focus?.source === "zoom" && (zoomedOut || !zoomFocus)) focus = null;

    if (zoomFocus && focus?.source !== "press") {
        const candidate = pickZoomFocus(viewport, trails);
        if (
            candidate &&
            candidate !== dismissedId &&
            candidate !== focus?.trailId
        ) {
            focus = { trailId: candidate, source: "zoom" };
        }
    }

    if (focus === state.focus && dismissedId === state.dismissedId) {
        return state;
    }
    return { focus, dismissedId };
}

/** Touch or long press on a trail: it takes the focus, whatever had it. */
export function focusByPress(trailId: string): TrailFocusState {
    return { focus: { trailId, source: "press" }, dismissedId: null };
}

/** Closes the preview, and keeps zooming from reopening it right away. */
export function dismissFocus(state: TrailFocusState): TrailFocusState {
    if (!state.focus) return state;
    return { focus: null, dismissedId: state.focus.trailId };
}
