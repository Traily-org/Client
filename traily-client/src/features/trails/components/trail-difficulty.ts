import type { TrailDifficulty } from "../types";

/**
 * Label and colors of each difficulty, shared by the card, the sheet and the
 * maps. `color` is for text on white; `routeColor`, brighter, draws the
 * route on a map, over a white casing.
 */
export const DIFFICULTY: Record<
    TrailDifficulty,
    { label: string; color: string; tint: string; routeColor: string }
> = {
    easy: {
        label: "Facile",
        color: "#2F8A4F",
        tint: "#E2F2E7",
        routeColor: "#1E9E57",
    },
    medium: {
        label: "Moyen",
        color: "#B87400",
        tint: "#FDF0D5",
        routeColor: "#E8890C",
    },
    hard: {
        label: "Difficile",
        color: "#C2412B",
        tint: "#FBE2DC",
        routeColor: "#D1263F",
    },
};
