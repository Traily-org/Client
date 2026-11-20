import { describe, expect, it } from "vitest";

import tailwindConfig from "../../tailwind.config.js";
import {
    cssVariableName,
    hexToRgbChannels,
    type ThemeColorRole,
    themeColors,
    toCssVariables,
} from "./theme-colors";

describe("hexToRgbChannels", () => {
    it("converts a hex color to space-separated channels", () => {
        expect(hexToRgbChannels("#1e1e2f")).toBe("30 30 47");
        expect(hexToRgbChannels("#FFFFFF")).toBe("255 255 255");
    });

    it("rejects anything but #rrggbb", () => {
        expect(() => hexToRgbChannels("#fff")).toThrow();
        expect(() => hexToRgbChannels("red")).toThrow();
    });
});

describe("themeColors", () => {
    it("only uses colors the CSS variables can carry", () => {
        for (const colors of Object.values(themeColors)) {
            expect(() => toCssVariables(colors)).not.toThrow();
        }
    });
});

describe("toCssVariables", () => {
    it("names each variable after its role", () => {
        const variables = toCssVariables(themeColors.light);
        expect(variables["--color-surface"]).toBe("255 255 255");
        expect(variables["--color-foreground-muted"]).toBe("107 114 128");
    });
});

// Loads tailwind.config.js the way Tailwind does: fails if theme-colors.ts
// gets an import that Node cannot resolve outside of the app bundler.
describe("tailwind.config.js", () => {
    it("exposes every role as a class backed by its variable", () => {
        const colors = tailwindConfig.theme?.extend?.colors;
        if (typeof colors !== "object" || colors === null) {
            throw new Error("tailwind.config.js declares no theme colors");
        }
        expect(Object.keys(colors).sort()).toEqual(
            Object.keys(themeColors.light).sort(),
        );
        for (const role of Object.keys(themeColors.light) as ThemeColorRole[]) {
            const variable = cssVariableName(role);
            expect(colors).toHaveProperty(
                [role],
                `rgb(var(${variable}) / <alpha-value>)`,
            );
        }
    });
});
