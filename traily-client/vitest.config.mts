import { fileURLToPath } from "node:url";

import { defineConfig } from "vitest/config";

export default defineConfig({
    // Same `@/*` → `src/*` alias as tsconfig.json, for services importing
    // the shared folders (e.g. `@/utils/bounds`).
    resolve: {
        alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) },
    },
    test: {
        environment: "node",
        passWithNoTests: true,
        coverage: {
            provider: "v8",
            reporter: ["text", "lcov"],
        },
    },
});
