import type { Viewport } from "@/utils/bounds";

/**
 * Trail drawn on the home map. Kept to what the map needs, so the map
 * feature doesn't depend on the trails feature.
 */
export interface MapTrail {
    id: string;
    /** Read by screen readers. */
    name: string;
    /** `[longitude, latitude]` points, start first. */
    route: [number, number][];
    /** Color of its route, e.g. by difficulty. The mode's red otherwise. */
    color?: string;
}

/** Shared by the native and web `TrailyMap`, which must expose the same API. */
export interface TrailyMapProps {
    /**
     * Extra space kept clear above the bottom safe area for the map chrome
     * (legal notices), e.g. when buttons are overlaid on the
     * bottom of the map.
     */
    bottomOffset?: number;
    /**
     * Trails drawn on the map: their start point when zoomed out, their
     * whole route closer in.
     */
    trails?: MapTrail[];
    /** Drawn above the others, e.g. the trail picked for the hike. */
    highlightedTrailId?: string;
    /**
     * Drawn on top and wider while the others fade back, with a cross at
     * its end, as on the trail sheet's map.
     */
    focusedTrailId?: string;
    /**
     * Framed each time it changes, e.g. the trail picked for the hike, which
     * may be anywhere when picked from the search.
     */
    framedTrailId?: string;
    /** Photo thumbnails pinned on the map, e.g. the focused trail's spots. */
    pins?: PhotoPin[];
    /** Touching a pin, e.g. to show its photo in large. */
    onPressPin?: (pinId: string) => void;
    /**
     * Touch or long press on a trail's route or start point (click or right
     * click on the web). The map frames the trail first, keeping room for
     * the controls and a preview at the bottom.
     */
    onPressTrail?: (trailId: string) => void;
    /** Touching the map anywhere but on a trail. */
    onPressMap?: () => void;
    /**
     * Area and zoom shown on screen, once the map has loaded and each time
     * it stops moving (not on every frame of a pan or zoom).
     */
    onViewportChange?: (viewport: Viewport) => void;
}

/** Photo thumbnail pinned on the map, e.g. a point of interest. */
export interface PhotoPin {
    id: string;
    /** `[longitude, latitude]`. */
    lngLat: [number, number];
    photoUrl: string;
    /** Read by screen readers. */
    label: string;
}

/** Shared by the native and web `TrailRouteMap`. */
export interface TrailRouteMapProps {
    /** `[longitude, latitude]` points, start first. */
    route: [number, number][];
    /** Color of the route and its ends. The mode's red otherwise. */
    color?: string;
    pins?: PhotoPin[];
    /** Touching a pin, e.g. to show its photo in large. */
    onPressPin?: (pinId: string) => void;
}
