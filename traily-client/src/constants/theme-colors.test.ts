import { describe, expect, it } from "vitest";

import tailwindConfig from "../../tailwind.config.js";
import {
    cssVariableName,
    hexToRgbChannels,
    type ThemeColorRole,
    themeColors,
    toCssVariables,
    withAlpha,
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

describe("withAlpha", () => {
    it("turns a role into a translucent rgba color", () => {
        expect(withAlpha("#141428", 0.2)).toBe("rgba(20, 20, 40, 0.2)");
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
        expect(variables["--color-foreground-muted"]).toBe("131 131 141");
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

/** WCAG contrast ratio between two #rrggbb colors (1 to 21). */
function contrast(a: string, b: string): number {
    const luminance = (hex: string) => {
        const [r, g, b] = hexToRgbChannels(hex)
            .split(" ")
            .map((channel) => {
                const c = Number(channel) / 255;
                return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
            });
        return 0.2126 * r + 0.7152 * g + 0.0722 * b;
    };
    const [light, dark] = [luminance(a), luminance(b)].sort((x, y) => y - x);
    return (light + 0.05) / (dark + 0.05);
}

describe("contrast", () => {
    it("keeps the main text readable in both schemes (WCAG AA, 4.5:1)", () => {
        for (const colors of Object.values(themeColors)) {
            expect(
                contrast(colors.foreground, colors.surface),
            ).toBeGreaterThanOrEqual(4.5);
            expect(
                contrast(colors.foreground, colors.screen),
            ).toBeGreaterThanOrEqual(4.5);
        }
    });

    it("keeps every dark text color at 4.5:1 on the surface", () => {
        const dark = themeColors.dark;
        const roles = [
            "foreground-muted",
            "danger",
            "accent",
            "difficulty-easy",
            "difficulty-medium",
            "difficulty-hard",
        ] as const;
        for (const role of roles) {
            expect(contrast(dark[role], dark.surface)).toBeGreaterThanOrEqual(
                4.5,
            );
        }
    });

    // Lucas's light palette puts these under 4.5:1 for small text (secondary
    // text 3.75, "Moyen" 3.79, white on orange 3.14): known, see TRA-136.
    // This floor stops them from getting worse.
    it("keeps the light secondary colors at least at 3:1", () => {
        const light = themeColors.light;
        expect(
            contrast(light["foreground-muted"], light.surface),
        ).toBeGreaterThanOrEqual(3);
        expect(
            contrast(light["difficulty-medium"], light.surface),
        ).toBeGreaterThanOrEqual(3);
        expect(
            contrast(light["on-accent"], light.accent),
        ).toBeGreaterThanOrEqual(3);
    });
});
