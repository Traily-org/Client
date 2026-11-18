import type { ThemeColorRole } from "@/constants/theme-colors";

import type { TrailDifficulty } from "../types";

/** Label and color roles of each difficulty, shared by the card and the sheet. */
export const DIFFICULTY: Record<
    TrailDifficulty,
    { label: string; color: ThemeColorRole; tint: ThemeColorRole }
> = {
    easy: {
        label: "Facile",
        color: "difficulty-easy",
        tint: "difficulty-easy-tint",
    },
    medium: {
        label: "Moyen",
        color: "difficulty-medium",
        tint: "difficulty-medium-tint",
    },
    hard: {
        label: "Difficile",
        color: "difficulty-hard",
        tint: "difficulty-hard-tint",
    },
};
