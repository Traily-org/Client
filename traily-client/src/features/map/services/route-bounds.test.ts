import { describe, expect, it } from "vitest";

import { getBounds } from "./route-bounds";

describe("getBounds", () => {
    it("wraps every point as [west, south, east, north]", () => {
        expect(
            getBounds([
                [6.1, 45.9],
                [6.3, 45.8],
                [6.2, 46],
            ]),
        ).toEqual([6.1, 45.8, 6.3, 46]);
    });

    it("collapses to the point for a single point", () => {
        expect(getBounds([[6, 45]])).toEqual([6, 45, 6, 45]);
    });
});
