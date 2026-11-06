const { defineConfig } = require("eslint/config");
const expoConfig = require("eslint-config-expo/flat");

// Folders shared by every feature (see CONTRIBUTING.md, "Architecture").
const SHARED_DIRS = "{components,hooks,lib,store,constants,types,utils}";

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
]);
