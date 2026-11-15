import { describe, expect, it } from "vitest";

import { getTrailDetails, getTrailsInArea } from "./trails-service";

describe("getTrailsInArea", () => {
    it("finds the trails whose route crosses the area", () => {
        // Around Talloires, on the eastern shore of the lake.
        const ids = getTrailsInArea([6.19, 45.81, 6.21, 45.84]).map(
            (trail) => trail.id,
        );
        expect(ids).toContain("roc-de-chere");
        expect(ids).toContain("cascade-angon");
        expect(ids).not.toContain("lac-de-la-thuile");
    });

    it("returns the same route as the trail sheet", () => {
        const [trail] = getTrailsInArea([6.2, 45.82, 6.2, 45.822]);
        expect(trail.route).toBe(getTrailDetails(trail.id)?.route);
    });

    it("gives each trail its difficulty, for its color", () => {
        const [trail] = getTrailsInArea([6.2, 45.82, 6.2, 45.822]);
        expect(trail.difficulty).toBe(getTrailDetails(trail.id)?.difficulty);
    });

    it("finds nothing far from every trail", () => {
        expect(getTrailsInArea([2.2, 48.8, 2.4, 48.9])).toEqual([]);
    });
});
