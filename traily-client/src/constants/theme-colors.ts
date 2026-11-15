/**
 * Color roles of the app, the single source of truth for the theme (TRA-126).
 * A component asks for a role (`bg-surface`, `text-foreground-muted`), never
 * for a color, so light and dark only differ here.
 *
 * Each role is a Tailwind color named after its key and backed by the CSS
 * variable `--color-<role>`, set at the root of the app by `ThemeRoot`.
 * `tailwind.config.js` reads the roles from this file, so it must not import
 * anything (no `@/` alias, no React Native): Metro, Prettier and the CI load
 * it outside of the app bundler.
 *
 * Light values keep the grays used before the theme, so migrating a component
 * does not change how it looks. Dark values are a first proposal.
 */

/** Resolved color scheme, after "system" is applied. */
export type ColorScheme = "light" | "dark";

const light = {
    /** Background of a screen, behind the cards. */
    screen: "#f3f4f6",
    /** Cards and rows. */
    surface: "#ffffff",
    /** Row under the finger. */
    "surface-pressed": "#f3f4f6",
    /** Main text. */
    foreground: "#111827",
    /** Secondary text: descriptions, section titles, values. */
    "foreground-muted": "#6b7280",
    /** Destructive action, such as signing out. */
    danger: "#dc2626",
    /** Line between two rows. */
    separator: "#f3f4f6",
    /** Square behind a row icon. */
    "icon-tile": "#f3f4f6",
    /** Row icon. */
    icon: "#4b5563",
    /** Unselected option of a choice. */
    chip: "#f3f4f6",
    /** Selected option of a choice. */
    "chip-selected": "#111827",
    /** Text on a selected option. */
    "on-chip-selected": "#ffffff",
} as const;

/** Every color role, as used in class names (`bg-<role>`, `text-<role>`). */
export type ThemeColorRole = keyof typeof light;

/** Hex colors (`#rrggbb`) of each role. */
export type ThemeColors = Record<ThemeColorRole, string>;

export const themeColors: Record<ColorScheme, ThemeColors> = {
    light,
    dark: {
        screen: "#111318",
        surface: "#1c1f26",
        "surface-pressed": "#262a33",
        foreground: "#f3f4f6",
        "foreground-muted": "#9ca3af",
        danger: "#f87171",
        separator: "#262a33",
        "icon-tile": "#262a33",
        icon: "#d1d5db",
        chip: "#262a33",
        "chip-selected": "#f3f4f6",
        "on-chip-selected": "#111827",
    },
};

/** Name of the CSS variable that backs a role. */
export function cssVariableName(role: ThemeColorRole): `--color-${string}` {
    return `--color-${role}`;
}

/**
 * CSS variables for one scheme, with "r g b" values as Tailwind expects them
 * in `rgb(var(--color-<role>) / <alpha-value>)`.
 */
export function toCssVariables(
    colors: ThemeColors,
): Record<`--color-${string}`, string> {
    const variables: Record<`--color-${string}`, string> = {};
    for (const [role, hex] of Object.entries(colors)) {
        variables[cssVariableName(role as ThemeColorRole)] =
            hexToRgbChannels(hex);
    }
    return variables;
}

/** "#1e1e2f" → "30 30 47". */
export function hexToRgbChannels(hex: string): string {
    const match = /^#([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i.exec(hex);
    if (!match) {
        throw new Error(`Theme color must be #rrggbb, got "${hex}"`);
    }
    return match
        .slice(1)
        .map((channel) => parseInt(channel, 16))
        .join(" ");
}
