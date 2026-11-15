import { useState } from "react";

import type { ViewedPhoto } from "@/components/photo-viewer";
import type { MapTrail, PhotoPin } from "@/features/map";
import type { Bounds, Viewport } from "@/utils/bounds";

import { DIFFICULTY } from "../components/trail-difficulty";
import { nextNearbyArea } from "../services/nearby-area";
import {
    dismissFocus,
    focusAfterViewport,
    focusByPress,
    NO_FOCUS,
    type TrailFocusState,
} from "../services/trail-focus";
import { getTrailDetails, getTrailsInArea } from "../services/trails-service";
import type { PointOfInterest, TrailRoute } from "../types";

/**
 * Zoomed out further, the focused trail's photo pins hide: they would
 * cover a route only a few pixels long.
 */
const PINS_MIN_ZOOM = 11;

// Shared default, so the pins stay the same object between renders.
const NO_POINTS: PointOfInterest[] = [];

interface HomeMapTrails {
    /** Area the trails were loaded for, null before the map reported one. */
    area: Bounds | null;
    trails: TrailRoute[];
    /** Zoom the map last settled on. */
    zoom: number;
    focus: TrailFocusState;
}

const INITIAL: HomeMapTrails = {
    area: null,
    trails: [],
    zoom: 0,
    focus: NO_FOCUS,
};

interface UseHomeMapTrailsOptions {
    /** Lets zooming in on a trail focus it. Off during a hike. */
    zoomFocus: boolean;
}

/** Each trail in the color of its difficulty. */
function toMapTrails(trails: TrailRoute[]): MapTrail[] {
    return trails.map((trail) => ({
        ...trail,
        color: DIFFICULTY[trail.difficulty].routeColor,
    }));
}

/**
 * Trails of the home map and the one in focus, with its points of interest
 * as photo pins (as on the trail sheet) and the photo opened from one. Fed
 * with the map's viewport each time it settles: loads the screen plus a
 * margin (again only once the screen leaves that area), then updates the
 * focus (see trail-focus).
 */
export function useHomeMapTrails({ zoomFocus }: UseHomeMapTrailsOptions) {
    const [state, setState] = useState(INITIAL);
    const [viewedPhoto, setViewedPhoto] = useState<ViewedPhoto | null>(null);

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
            if (
                !area &&
                focus === current.focus &&
                viewport.zoom === current.zoom
            ) {
                return current;
            }
            return {
                area: area ?? current.area,
                trails,
                zoom: viewport.zoom,
                focus,
            };
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

    const focusedTrailId = state.focus.focus?.trailId;
    const focused = focusedTrailId
        ? getTrailDetails(focusedTrailId)
        : undefined;
    const points =
        focused && state.zoom >= PINS_MIN_ZOOM
            ? focused.pointsOfInterest
            : NO_POINTS;
    const pins: PhotoPin[] = points.map((point) => ({
        id: point.id,
        lngLat: point.lngLat,
        photoUrl: point.photo.url,
        label: point.title,
    }));

    function viewPin(pinId: string) {
        const point = points.find((candidate) => candidate.id === pinId);
        if (!point) return;
        setViewedPhoto({
            url: point.photo.url,
            caption: point.title,
            credit: point.photo.credit,
        });
    }

    return {
        trails: toMapTrails(state.trails),
        focusedTrailId,
        pins,
        viewedPhoto,
        updateViewport,
        focusTrail,
        closeFocus,
        viewPin,
        closePhoto: () => setViewedPhoto(null),
    };
}
