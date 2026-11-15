import { getVersion, setWorkerUrl } from "maplibre-gl";

let setupDone = false;

/**
 * maplibre-gl locates its tile-parsing worker via `import.meta.url`, which
 * Metro doesn't preserve per-module — it resolves to the entry bundle's URL
 * instead, so the worker 404s and no vector layers render (the style still
 * loads and paints the background/markers, since those don't need the
 * worker). Point it at jsDelivr's build of the exact installed version
 * instead, which serves it with CORS enabled.
 */
export function setupMapLibreForWeb() {
    if (setupDone) return;
    setWorkerUrl(
        `https://cdn.jsdelivr.net/npm/maplibre-gl@${getVersion()}/dist/maplibre-gl-worker.mjs`,
    );
    setupDone = true;
}
