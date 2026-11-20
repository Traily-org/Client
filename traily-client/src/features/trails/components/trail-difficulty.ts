import type { ThemeColorRole } from "@/constants/theme-colors";

import type { TrailDifficulty } from "../types";

/**
 * Label and color roles of each difficulty, shared by the card, the sheet and
 * the maps. `color` is for text, `tint` the pale background behind it, and
 * `route` the brighter line drawn on a map (a map role, see
 * `mapOverlayColors`).
 */
export const DIFFICULTY: Record<
    TrailDifficulty,
    {
        label: string;
        color: ThemeColorRole;
        tint: ThemeColorRole;
        route: ThemeColorRole;
    }
> = {
    easy: {
        label: "Facile",
        color: "difficulty-easy",
        tint: "difficulty-easy-tint",
        route: "difficulty-easy-route",
    },
    medium: {
        label: "Moyen",
        color: "difficulty-medium",
        tint: "difficulty-medium-tint",
        route: "difficulty-medium-route",
    },
    hard: {
        label: "Difficile",
        color: "difficulty-hard",
        tint: "difficulty-hard-tint",
        route: "difficulty-hard-route",
    },
};
