// Dev-only CORS proxy for the browser build.
//
// `build.protomaps.com` (the free Protomaps daily planet PMTiles build,
// configured via EXPO_PUBLIC_PM_TILES_URL) does not send
// `Access-Control-Allow-Origin`, so the browser blocks the ranged fetches
// the `pmtiles` package needs — even though `curl` and MapLibre Native (iOS/
// Android, not subject to CORS) can read it directly. This proxy re-serves
// the same bytes with CORS headers added, for `expo start --web` only.
//
// Started automatically by `pnpm web` (see dev-web.mjs). Run standalone with
// `pnpm web:tiles-proxy` if you ever need it on its own.
import { createServer } from "node:http";
import { Readable } from "node:stream";
import { pathToFileURL } from "node:url";

const DEFAULT_PORT = 8082;
const UPSTREAM_ORIGIN = "https://build.protomaps.com";

const CORS_HEADERS = {
    "access-control-allow-origin": "*",
    "access-control-allow-headers": "range",
    "access-control-expose-headers":
        "content-range, content-length, accept-ranges, etag, cache-control",
};

const RETRIES = 2;
const RETRY_DELAY_MS = 250;

function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

// build.protomaps.com occasionally answers a range request with a transient
// 5xx (or the connection drops) under the burst of parallel range requests a
// map pan triggers — that's what was showing up as blank/half-loaded tiles.
// Retry a couple of times before giving up.
async function fetchWithRetry(url, options, attemptsLeft = RETRIES) {
    try {
        const response = await fetch(url, options);
        if (response.status >= 500 && attemptsLeft > 0) {
            await sleep(RETRY_DELAY_MS);
            return fetchWithRetry(url, options, attemptsLeft - 1);
        }
        return response;
    } catch (error) {
        if (attemptsLeft > 0) {
            await sleep(RETRY_DELAY_MS);
            return fetchWithRetry(url, options, attemptsLeft - 1);
        }
        throw error;
    }
}

export function startPmtilesDevProxy(port = DEFAULT_PORT) {
    const server = createServer(async (req, res) => {
        if (req.method === "OPTIONS") {
            res.writeHead(204, CORS_HEADERS);
            res.end();
            return;
        }

        try {
            const upstream = await fetchWithRetry(UPSTREAM_ORIGIN + req.url, {
                headers: {
                    ...(req.headers.range ? { range: req.headers.range } : {}),
                    ...(req.headers["if-none-match"]
                        ? { "if-none-match": req.headers["if-none-match"] }
                        : {}),
                    ...(req.headers["if-modified-since"]
                        ? {
                              "if-modified-since":
                                  req.headers["if-modified-since"],
                          }
                        : {}),
                },
            });

            res.writeHead(upstream.status, {
                "content-type":
                    upstream.headers.get("content-type") ??
                    "application/octet-stream",
                "content-length":
                    upstream.headers.get("content-length") ?? undefined,
                "content-range":
                    upstream.headers.get("content-range") ?? undefined,
                "accept-ranges":
                    upstream.headers.get("accept-ranges") ?? undefined,
                // Upstream sends no cache-control at all, so nothing was
                // cacheable by the browser and every re-pan re-fetched the
                // same bytes. The file is immutable (daily-dated, content
                // never changes under a given name), so cache it hard.
                "cache-control":
                    upstream.headers.get("cache-control") ??
                    "public, max-age=31536000, immutable",
                etag: upstream.headers.get("etag") ?? undefined,
                "last-modified":
                    upstream.headers.get("last-modified") ?? undefined,
                ...CORS_HEADERS,
            });

            if (upstream.body) {
                const upstreamStream = Readable.fromWeb(upstream.body);
                // A stream 'error' event with no listener is a crash, not a
                // rejection the surrounding try/catch can see — this pipe
                // runs after the handler's promise has already settled. If
                // the upstream connection drops mid-transfer (as it does
                // under bursts of parallel range requests), fail just that
                // one response instead of taking the whole proxy down.
                upstreamStream.on("error", (error) => {
                    console.error(
                        "PMTiles dev proxy: upstream stream error",
                        error,
                    );
                    res.destroy(error);
                });
                res.on("error", (error) => {
                    console.error(
                        "PMTiles dev proxy: response stream error",
                        error,
                    );
                });
                upstreamStream.pipe(res);
            } else {
                res.end();
            }
        } catch (error) {
            console.error("PMTiles dev proxy: upstream fetch failed", error);
            res.writeHead(502, CORS_HEADERS);
            res.end(
                `Upstream fetch failed: ${error instanceof Error ? error.message : error}`,
            );
        }
    });

    server.listen(port, () => {
        console.log(
            `PMTiles dev CORS proxy listening on http://localhost:${port}`,
        );
    });

    return server;
}

const isMain =
    process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;
if (isMain) {
    startPmtilesDevProxy(
        process.env.PMTILES_PROXY_PORT
            ? Number(process.env.PMTILES_PROXY_PORT)
            : DEFAULT_PORT,
    );
}
