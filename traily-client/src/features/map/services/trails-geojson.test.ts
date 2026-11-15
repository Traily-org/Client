import { describe, expect, it } from "vitest";

import { getTrailId, toTrailsGeoJSON } from "./trails-geojson";

const SEMNOZ = {
    id: "semnoz",
    name: "Semnoz",
    route: [
        [6.03, 45.75],
        [6.04, 45.76],
    ] as [number, number][],
};
const VEYRIER = {
    id: "mont-veyrier",
    name: "Mont Veyrier",
    route: [
        [6.16, 45.88],
        [6.17, 45.89],
    ] as [number, number][],
};

describe("toTrailsGeoJSON", () => {
    it("draws a line per route, then a point per start", () => {
        const { features } = toTrailsGeoJSON([SEMNOZ, VEYRIER]);
        expect(features.map((feature) => feature.geometry.type)).toEqual([
            "LineString",
            "LineString",
            "Point",
            "Point",
        ]);
        expect(features[2].geometry.coordinates).toEqual([6.03, 45.75]);
    });

    it("puts the highlighted trail last and flags it", () => {
        const { features } = toTrailsGeoJSON([SEMNOZ, VEYRIER], "semnoz");
        expect(features[1].properties).toEqual({
            trailId: "semnoz",
            highlighted: true,
            focused: false,
            dimmed: false,
        });
        expect(features[2].properties.highlighted).toBe(false);
        expect(features[3].properties.trailId).toBe("semnoz");
    });

    it("draws the focused trail on top and fades the others", () => {
        const { features } = toTrailsGeoJSON(
            [SEMNOZ, VEYRIER],
            "semnoz",
            "mont-veyrier",
        );
        expect(features[0].properties.trailId).toBe("semnoz");
        expect(features[0].properties.dimmed).toBe(true);
        expect(features[1].properties).toMatchObject({
            trailId: "mont-veyrier",
            focused: true,
            dimmed: false,
        });
    });

    it("carries each trail's color", () => {
        const { features } = toTrailsGeoJSON([{ ...SEMNOZ, color: "#1E9E57" }]);
        expect(features.map((feature) => feature.properties.color)).toEqual([
            "#1E9E57",
            "#1E9E57",
        ]);
    });

    it("skips a trail without route points", () => {
        const empty = { id: "empty", name: "Vide", route: [] };
        expect(toTrailsGeoJSON([empty]).features).toEqual([]);
    });
});

describe("getTrailId", () => {
    it("reads the trail id of a touched feature", () => {
        expect(getTrailId({ properties: { trailId: "semnoz" } })).toBe(
            "semnoz",
        );
    });

    it("returns null for a feature from another source", () => {
        expect(getTrailId({ properties: { name: "Annecy" } })).toBeNull();
        expect(getTrailId({ properties: null })).toBeNull();
        expect(getTrailId({})).toBeNull();
    });
});
