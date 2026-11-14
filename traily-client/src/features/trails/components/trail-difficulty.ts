import type { TrailDifficulty } from "../types";

/** Label and colors of each difficulty, shared by the card and the sheet. */
export const DIFFICULTY: Record<
    TrailDifficulty,
    { label: string; color: string; tint: string }
> = {
    easy: { label: "Facile", color: "#2F8A4F", tint: "#E2F2E7" },
    medium: { label: "Moyen", color: "#B87400", tint: "#FDF0D5" },
    hard: { label: "Difficile", color: "#C2412B", tint: "#FBE2DC" },
};
