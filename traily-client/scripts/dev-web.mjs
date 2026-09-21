// `pnpm web` entry point: starts the PMTiles CORS dev proxy in-process, then
// runs `expo start --web` as a child process so a single command/terminal
// covers both. See pmtiles-dev-proxy.mjs for why the proxy is needed.
import { spawn } from "node:child_process";

import { startPmtilesDevProxy } from "./pmtiles-dev-proxy.mjs";

const proxyServer = startPmtilesDevProxy();

const expo = spawn("npx", ["expo", "start", "--web"], {
    stdio: "inherit",
    shell: process.platform === "win32",
});

expo.on("exit", (code) => {
    proxyServer.close(() => process.exit(code ?? 0));
});

process.on("SIGINT", () => expo.kill("SIGINT"));
process.on("SIGTERM", () => expo.kill("SIGTERM"));
