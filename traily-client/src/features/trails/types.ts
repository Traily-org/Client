export type TrailDifficulty = "easy" | "medium" | "hard";

/** `[longitude, latitude]`, the GeoJSON and MapLibre order. */
export type LngLat = [number, number];

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
    cover: TrailPhoto;
}

export interface TrailPhoto {
    url: string;
    /** Author and license, when the photo requires a credit. */
    credit?: string;
}

/** Hiker who published a trail. */
export interface TrailCreator {
    id: string;
    name: string;
}

/** Spot worth a stop along a trail. */
export interface PointOfInterest {
    id: string;
    title: string;
    description: string;
    photo: TrailPhoto;
    lngLat: LngLat;
}

/** Everything the trail sheet shows. */
export interface TrailDetails extends Trail {
    description: string;
    creator: TrailCreator;
    /** Route line, start first. */
    route: LngLat[];
    /** In the order they are met along the route. */
    pointsOfInterest: PointOfInterest[];
}
