/** Shared by the native and web `TrailyMap`, which must expose the same API. */
export interface TrailyMapProps {
    /**
     * Extra space kept clear above the bottom safe area for the map chrome
     * (legal notices), e.g. when buttons are overlaid on the
     * bottom of the map.
     */
    bottomOffset?: number;
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
    pins?: PhotoPin[];
    /** Touching a pin, e.g. to show its photo in large. */
    onPressPin?: (pinId: string) => void;
}
