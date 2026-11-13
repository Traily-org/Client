export type HikeStatus = "idle" | "running" | "paused";

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
}
