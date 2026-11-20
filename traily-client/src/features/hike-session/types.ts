export type HikeStatus = "idle" | "running" | "paused";

/** `[longitude, latitude]`, the GeoJSON and MapLibre order. */
export type LngLat = [number, number];

/** A position given by the GPS (simulated until TRA-76). */
export interface LocationFix {
    lngLat: LngLat;
    /** Radius the real position lies within, in meters. */
    accuracyM: number;
    /** When the position was taken, in ms. */
    timestamp: number;
}

/** What the GPS told about the hike so far (see hike-tracking). */
export interface HikeTracking {
    /** The walker's own track: every fix kept, start first. */
    track: LngLat[];
    /** Last fix kept, to tell a glitch from the next one. */
    lastFix: LocationFix | null;
    /** Length of the track, detours included, in meters. */
    distanceM: number;
    /** How far along the planned route the walker got, in meters. */
    progressM: number;
    /** Length of the planned route, in meters, 0 before the first fix. */
    routeLengthM: number;
    offTrail: boolean;
    /** Distance from the last fix to the planned route, in meters. */
    distanceToRouteM: number;
    /** Fixes in a row past the threshold to go off or back on the trail. */
    streak: number;
    /** Where to draw the walker, null before the first fix. */
    position: LngLat | null;
    /** Direction of travel, in degrees clockwise from north. */
    heading: number;
}

/** Trail followed by the hike, picked in the search. */
export interface HikeTrail {
    id: string;
    name: string;
    distanceKm: number;
    elevationGainM: number;
}

export interface HikeSession {
    /** Null until a trail is picked; a hike can't start without one. */
    trail: HikeTrail | null;
    status: HikeStatus;
    /** Time walked before the current running stretch, in ms. */
    elapsedBeforeMs: number;
    /** Start of the current running stretch (epoch ms), null unless running. */
    runningSince: number | null;
    /** What the GPS told since the start. */
    tracking: HikeTracking;
}
