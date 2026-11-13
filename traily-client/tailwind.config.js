/**
 * Color roles of the theme, defined in src/constants/theme-colors.ts.
 * theme-colors.test.ts checks this list matches it.
 */
const THEME_COLOR_ROLES = [
    "screen",
    "surface",
    "surface-pressed",
    "foreground",
    "foreground-muted",
    "danger",
    "separator",
    "icon-tile",
    "icon",
    "chip",
    "chip-selected",
    "on-chip-selected",
];

/** @type {import('tailwindcss').Config} */
module.exports = {
    content: ["./app/**/*.{js,jsx,ts,tsx}", "./src/**/*.{js,jsx,ts,tsx}"],
    presets: [require("nativewind/preset")],
    // "class" lets the app switch light/dark itself; with "media" NativeWind
    // throws on web when the scheme is set by hand.
    darkMode: "class",
    theme: {
        extend: {
            colors: Object.fromEntries(
                THEME_COLOR_ROLES.map((role) => [
                    role,
                    `rgb(var(--color-${role}) / <alpha-value>)`,
                ]),
            ),
        },
    },
    plugins: [],
};
