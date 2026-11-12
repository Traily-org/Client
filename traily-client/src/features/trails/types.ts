export type TrailDifficulty = "easy" | "medium" | "hard";

export interface Trail {
    id: string;
    name: string;
    /** Area or nearest village, shown under the name. */
    location: string;
    distanceKm: number;
    elevationGainM: number;
    durationMin: number;
    difficulty: TrailDifficulty;
    /**
     * Rough shape of the route, start first, normalized to a 0-1 box (y
     * pointing down). Drawn as a small sketch on the trail card.
     */
    sketch: [number, number][];
}
