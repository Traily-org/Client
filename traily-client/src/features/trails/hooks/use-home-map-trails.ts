import { useState } from "react";

import type { Bounds, Viewport } from "@/utils/bounds";

import { nextNearbyArea } from "../services/nearby-area";
import {
    dismissFocus,
    focusAfterViewport,
    focusByPress,
    NO_FOCUS,
    type TrailFocusState,
} from "../services/trail-focus";
import { getTrailsInArea } from "../services/trails-service";
import type { TrailRoute } from "../types";

interface HomeMapTrails {
    /** Area the trails were loaded for, null before the map reported one. */
    area: Bounds | null;
    trails: TrailRoute[];
    focus: TrailFocusState;
}

const INITIAL: HomeMapTrails = { area: null, trails: [], focus: NO_FOCUS };

interface UseHomeMapTrailsOptions {
    /** Lets zooming in on a trail focus it. Off during a hike. */
    zoomFocus: boolean;
}

/**
 * Trails of the home map and the one in focus. Fed with the map's viewport
 * each time it settles: loads the screen plus a margin (again only once the
 * screen leaves that area), then updates the focus (see trail-focus).
 */
export function useHomeMapTrails({ zoomFocus }: UseHomeMapTrailsOptions) {
    const [state, setState] = useState(INITIAL);

    function updateViewport(viewport: Viewport) {
        setState((current) => {
            const area = nextNearbyArea(viewport.bounds, current.area);
            const trails = area ? getTrailsInArea(area) : current.trails;
            const focus = focusAfterViewport(
                current.focus,
                viewport,
                trails,
                zoomFocus,
            );
            if (!area && focus === current.focus) return current;
            return { area: area ?? current.area, trails, focus };
        });
    }

    function focusTrail(trailId: string) {
        setState((current) => ({ ...current, focus: focusByPress(trailId) }));
    }

    function closeFocus() {
        setState((current) => {
            const focus = dismissFocus(current.focus);
            return focus === current.focus ? current : { ...current, focus };
        });
    }

    return {
        trails: state.trails,
        focusedTrailId: state.focus.focus?.trailId,
        updateViewport,
        focusTrail,
        closeFocus,
    };
}
