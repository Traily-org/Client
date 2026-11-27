const { defineConfig } = require("eslint/config");
const expoConfig = require("eslint-config-expo/flat");

// Folders shared by every feature (see CONTRIBUTING.md, "Architecture").
const SHARED_DIRS = "{components,hooks,lib,store,constants,types,utils}";

// Raw colors do not follow light / dark mode: use a theme color role
// (bg-surface, text-foreground...) from src/constants/theme-colors.ts.
const TAILWIND_PALETTE =
    "(slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-[0-9]{2,3}";
const RAW_COLOR_PATTERNS = [
    "#[0-9a-fA-F]{3,8}\\b",
    "(rgb|hsl)a?\\s*\\(",
    "^(white|black)$",
    `\\b(bg|text|border(-[xytrblse])?|divide|ring|fill|stroke|shadow|outline|from|to|via|placeholder|caret|accent|decoration)-(${TAILWIND_PALETTE}|white|black)\\b`,
];
const RAW_COLOR_MESSAGE =
    "Use a theme color role (bg-surface, text-foreground...) from src/constants/theme-colors.ts instead of a raw color.";
const RAW_COLOR_SELECTORS = RAW_COLOR_PATTERNS.flatMap((pattern) => [
    { selector: `Literal[value=/${pattern}/]`, message: RAW_COLOR_MESSAGE },
    {
        selector: `TemplateElement[value.raw=/${pattern}/]`,
        message: RAW_COLOR_MESSAGE,
    },
]);

// On Android and iOS, NativeWind's wrapper around Pressable drops a style
// given as a function: the whole style is lost (the web keeps it).
const STYLE_FUNCTION_SELECTOR = {
    selector:
        "JSXAttribute[name.name='style'] > JSXExpressionContainer > :matches(ArrowFunctionExpression, FunctionExpression)",
    message:
        "A style function is dropped on native by NativeWind: use usePressed() from @/hooks/use-pressed and a plain style.",
};

const RESTRICTED_SYNTAX_RULE = [
    "error",
    ...RAW_COLOR_SELECTORS,
    STYLE_FUNCTION_SELECTOR,
];

module.exports = defineConfig([
    expoConfig,
    {
        ignores: ["node_modules/", ".expo/", "dist/", "build/"],
    },
    {
        files: ["**/*.{ts,tsx}"],
        rules: {
            "import/no-cycle": "error",
        },
    },
    {
        files: ["app/**/*.{ts,tsx}", "src/**/*.{ts,tsx}"],
        rules: {
            "no-restricted-imports": [
                "error",
                {
                    patterns: [
                        {
                            group: ["@/features/*/*"],
                            message:
                                "Import a feature through its public API: @/features/<name> (index.ts).",
                        },
                    ],
                },
            ],
        },
    },
    {
        files: [`src/${SHARED_DIRS}/**/*.{ts,tsx}`],
        rules: {
            "no-restricted-imports": [
                "error",
                {
                    patterns: [
                        {
                            group: ["@/features/*", "@/features/*/*"],
                            message:
                                "Shared code must not depend on a feature.",
                        },
                    ],
                },
            ],
        },
    },
    {
        files: ["app/**/*.{ts,tsx}", "src/**/*.{ts,tsx}"],
        // Where the colors are defined, the map style (kept out of the
        // theme), and tests: no JSX there either.
        ignores: [
            "src/constants/theme-colors.ts",
            "src/features/map/style/**",
            "**/*.test.ts",
        ],
        rules: { "no-restricted-syntax": RESTRICTED_SYNTAX_RULE },
    },
]);
