// Color roles come from the single source of the theme. Node 22 loads the
// TypeScript file itself (type stripping); Tailwind falls back to jiti
// otherwise. After adding or renaming a role, restart Metro (`expo start -c`):
// the dev server does not reload this file.
const {
    cssVariableName,
    themeColors,
} = require("./src/constants/theme-colors.ts");

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
                Object.keys(themeColors.light).map((role) => [
                    role,
                    `rgb(var(${cssVariableName(role)}) / <alpha-value>)`,
                ]),
            ),
        },
    },
    plugins: [],
};
