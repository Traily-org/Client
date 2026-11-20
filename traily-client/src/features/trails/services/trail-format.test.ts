import { describe, expect, it } from "vitest";

import { formatDistance, formatDuration, getInitials } from "./trail-format";

describe("formatDistance", () => {
    it("uses a decimal comma", () => {
        expect(formatDistance(11.25)).toBe("11,3 km");
    });
});

describe("formatDuration", () => {
    it("shows minutes, whole hours, or hours and padded minutes", () => {
        expect(formatDuration(45)).toBe("45 min");
        expect(formatDuration(120)).toBe("2 h");
        expect(formatDuration(245)).toBe("4 h 05");
    });
});

describe("getInitials", () => {
    it("keeps the first letter of the first two words", () => {
        expect(getInitials("Léa  Fontaine du Lac")).toBe("LF");
        expect(getInitials("camille")).toBe("C");
    });
});
