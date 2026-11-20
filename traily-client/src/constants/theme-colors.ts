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
 * Light values follow the home screen palette (Lucas's style), so migrating a
 * home component does not change how it looks. Dark values are a first
 * proposal; theme-colors.test.ts checks their contrast.
 */

/** Resolved color scheme, after "system" is applied. */
export type ColorScheme = "light" | "dark";

// Light values come from the home screen palette (TRA-124, TRA-81): navy text
// #1e1e2f, lavender panels, orange accent. Translucent navy over white is
// flattened to an opaque value (e.g. 55 % → #83838d).
const light = {
    /** Background of a screen, behind the cards. */
    screen: "#f4f2f8",
    /** Cards, rows and sheets. */
    surface: "#ffffff",
    /** Block inside a sheet, such as the creator or a point of interest. */
    "surface-muted": "#f6f5f2",
    /** Frame shown while a map or a photo loads. */
    placeholder: "#e9e7e0",
    /** Row under the finger. */
    "surface-pressed": "#ededee",
    /** Main text. */
    foreground: "#1e1e2f",
    /** Secondary text: descriptions, section titles, values. */
    "foreground-muted": "#83838d",
    /** Destructive action, such as signing out. */
    danger: "#c9391a",
    /** Something running fine, such as a hike in progress. */
    success: "#2f8a4f",
    /** Something on hold, such as a paused hike. */
    warning: "#b87400",
    /** Line between two rows. */
    separator: "#dddde0",
    /** Square behind a row icon. */
    "icon-tile": "#f2f2f3",
    /** Row icon. */
    icon: "#62626d",
    /** Unselected option of a choice. */
    chip: "#ededee",
    /** Selected option of a choice. */
    "chip-selected": "#e0733f",
    /** Text on a selected option. */
    "on-chip-selected": "#ffffff",
    /** Main action and highlights (choose a trail, start, favorite). */
    accent: "#e0733f",
    /** Text and icons on the accent color, and on the avatar. */
    "on-accent": "#ffffff",
    /** Initials badge of a person. */
    avatar: "#2f6b4f",
    /** Shadows and dimming layers, used through `withAlpha`. */
    shadow: "#141428",
    /** Trail difficulty: label color, then the pale background behind it. */
    "difficulty-easy": "#2f8a4f",
    "difficulty-easy-tint": "#e2f2e7",
    "difficulty-medium": "#b87400",
    "difficulty-medium-tint": "#fdf0d5",
    "difficulty-hard": "#c2412b",
    "difficulty-hard-tint": "#fbe2dc",
} as const;

/** Every color role, as used in class names (`bg-<role>`, `text-<role>`). */
export type ThemeColorRole = keyof typeof light;

/** Hex colors (`#rrggbb`) of each role. */
export type ThemeColors = Record<ThemeColorRole, string>;

export const themeColors: Record<ColorScheme, ThemeColors> = {
    light,
    // Built from the same navy, so dark mode keeps the home screen identity.
    dark: {
        screen: "#121221",
        surface: "#1e1e2f",
        "surface-muted": "#26263a",
        placeholder: "#2e2e44",
        "surface-pressed": "#2a2a3e",
        foreground: "#f2f1f7",
        "foreground-muted": "#a9a8b8",
        danger: "#f07a62",
        success: "#5cc27e",
        warning: "#e3a73b",
        separator: "#2e2e44",
        "icon-tile": "#2a2a3e",
        icon: "#c3c2d2",
        chip: "#2a2a3e",
        "chip-selected": "#e0733f",
        "on-chip-selected": "#ffffff",
        accent: "#e0733f",
        "on-accent": "#ffffff",
        avatar: "#357a59",
        shadow: "#000000",
        "difficulty-easy": "#5cc27e",
        "difficulty-easy-tint": "#1c3326",
        "difficulty-medium": "#e3a73b",
        "difficulty-medium-tint": "#3a2e14",
        "difficulty-hard": "#f07a62",
        "difficulty-hard-tint": "#3e2019",
    },
};

/**
 * Colors of what sits on the map (glass controls, markers, current hike card):
 * always the light scheme, since the map underneath stays light.
 */
export const mapOverlayColors: ThemeColors = themeColors.light;

/** Colors of the full-screen photo viewer: always dark, around the photo. */
export const photoViewerColors: ThemeColors = themeColors.dark;

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

/**
 * Translucent version of a role, for shadows and dimming layers:
 * `withAlpha(colors.shadow, 0.2)` → "rgba(20, 20, 40, 0.2)".
 */
export function withAlpha(hex: string, alpha: number): string {
    return `rgba(${hexToRgbChannels(hex).replaceAll(" ", ", ")}, ${alpha})`;
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
