import { describe, expect, it, vi } from "vitest";

import {
    getFavoriteTrailIds,
    subscribeFavoriteTrails,
    toggleFavoriteTrail,
} from "./favorite-trails";

describe("toggleFavoriteTrail", () => {
    it("adds then removes a trail and notifies with a new set", () => {
        const listener = vi.fn();
        const unsubscribe = subscribeFavoriteTrails(listener);
        const before = getFavoriteTrailIds();

        toggleFavoriteTrail("semnoz");
        expect(getFavoriteTrailIds().has("semnoz")).toBe(true);
        expect(getFavoriteTrailIds()).not.toBe(before);

        toggleFavoriteTrail("semnoz");
        expect(getFavoriteTrailIds().has("semnoz")).toBe(false);
        expect(listener).toHaveBeenCalledTimes(2);
        unsubscribe();
    });
});
