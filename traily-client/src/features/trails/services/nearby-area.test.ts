import { describe, expect, it } from "vitest";

import { nextNearbyArea } from "./nearby-area";

describe("nextNearbyArea", () => {
    it("loads the screen with a margin the first time", () => {
        expect(nextNearbyArea([0, 0, 4, 2], null)).toEqual([-2, -1, 6, 3]);
    });

    it("skips loading while the loaded area covers the screen", () => {
        expect(nextNearbyArea([1, 0, 5, 2], [-2, -1, 6, 3])).toBeNull();
    });

    it("loads again once the screen leaves the loaded area", () => {
        expect(nextNearbyArea([5, 0, 9, 2], [-2, -1, 6, 3])).toEqual([
            3, -1, 11, 3,
        ]);
    });

    it("loads again after zooming out past the loaded area", () => {
        expect(nextNearbyArea([-4, -2, 8, 4], [-2, -1, 6, 3])).not.toBeNull();
    });
});
