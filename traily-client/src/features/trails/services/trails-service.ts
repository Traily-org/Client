import type { Trail } from "../types";

// TODO(api): mock data until the trails endpoints exist (TRA-83). Real
// places around Annecy, where the map opens; the figures are made up.
const TRAILS: Trail[] = [
    {
        id: "semnoz",
        name: "Tour du Semnoz par le Crêt de Châtillon",
        location: "Semnoz",
        distanceKm: 11.2,
        elevationGainM: 620,
        durationMin: 240,
        difficulty: "medium",
        sketch: [
            [0.1, 0.85],
            [0.25, 0.7],
            [0.2, 0.45],
            [0.4, 0.3],
            [0.55, 0.4],
            [0.75, 0.2],
            [0.9, 0.1],
        ],
    },
    {
        id: "mont-veyrier",
        name: "Mont Veyrier par le col des Contrebandiers",
        location: "Veyrier-du-Lac",
        distanceKm: 8.4,
        elevationGainM: 860,
        durationMin: 270,
        difficulty: "hard",
        sketch: [
            [0.15, 0.9],
            [0.3, 0.75],
            [0.25, 0.6],
            [0.45, 0.5],
            [0.4, 0.35],
            [0.6, 0.25],
            [0.85, 0.15],
        ],
    },
    {
        id: "roc-de-chere",
        name: "Réserve du Roc de Chère",
        location: "Talloires",
        distanceKm: 5.1,
        elevationGainM: 180,
        durationMin: 105,
        difficulty: "easy",
        sketch: [
            [0.2, 0.2],
            [0.45, 0.15],
            [0.75, 0.3],
            [0.8, 0.6],
            [0.55, 0.8],
            [0.3, 0.7],
            [0.25, 0.45],
        ],
    },
    {
        id: "cascade-angon",
        name: "Cascade d'Angon",
        location: "Talloires",
        distanceKm: 3.2,
        elevationGainM: 140,
        durationMin: 75,
        difficulty: "easy",
        sketch: [
            [0.1, 0.6],
            [0.3, 0.55],
            [0.45, 0.65],
            [0.6, 0.45],
            [0.8, 0.4],
            [0.9, 0.25],
        ],
    },
    {
        id: "dents-de-lanfon",
        name: "Dents de Lanfon",
        location: "Col de Bluffy",
        distanceKm: 7.6,
        elevationGainM: 720,
        durationMin: 225,
        difficulty: "hard",
        sketch: [
            [0.1, 0.8],
            [0.3, 0.8],
            [0.4, 0.6],
            [0.35, 0.4],
            [0.55, 0.35],
            [0.7, 0.15],
            [0.9, 0.2],
        ],
    },
    {
        id: "parmelan",
        name: "Le Parmelan par le chalet de l'Anglettaz",
        location: "Villaz",
        distanceKm: 9.8,
        elevationGainM: 680,
        durationMin: 255,
        difficulty: "medium",
        sketch: [
            [0.15, 0.85],
            [0.2, 0.6],
            [0.4, 0.55],
            [0.5, 0.35],
            [0.7, 0.3],
            [0.85, 0.12],
        ],
    },
    {
        id: "lac-de-la-thuile",
        name: "Tour du lac de la Thuile",
        location: "Bauges",
        distanceKm: 4.3,
        elevationGainM: 60,
        durationMin: 80,
        difficulty: "easy",
        sketch: [
            [0.3, 0.2],
            [0.65, 0.2],
            [0.85, 0.45],
            [0.7, 0.75],
            [0.35, 0.8],
            [0.15, 0.55],
            [0.25, 0.3],
        ],
    },
];

/** Strips case and accents so "chere" matches "Chère". */
function normalize(text: string): string {
    return text
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase();
}

export function getRecommendedTrails(): Trail[] {
    return TRAILS;
}

/** Trails whose name or location contains the query. */
export function searchTrails(query: string): Trail[] {
    const needle = normalize(query.trim());
    return TRAILS.filter(
        (trail) =>
            normalize(trail.name).includes(needle) ||
            normalize(trail.location).includes(needle),
    );
}
