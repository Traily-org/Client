/**
 * Remembers the native fingerprint each platform's last development build
 * was made from, so `task build:<platform>` only rebuilds when native code
 * changed (dependencies, app.json, config plugins). JS changes reach the
 * installed build through Metro and never need a rebuild.
 *
 *   hash <platform>          print the current fingerprint
 *   check <platform> <hash>  exit 0 if the last build matches (Task `status`)
 *   save <platform> <hash>   record a successful build
 *   report                   tell whether the installed builds are stale
 */
import { createFingerprintAsync } from "@expo/fingerprint";
import { mkdir, readFile, writeFile } from "node:fs/promises";

// `.expo/` is already gitignored: per-machine state, like the builds
// installed on this developer's devices.
const STATE_DIR = ".expo";
const STATE_FILE = `${STATE_DIR}/dev-builds.json`;
const PLATFORMS = ["android", "ios"];

async function readState() {
    try {
        return JSON.parse(await readFile(STATE_FILE, "utf8"));
    } catch {
        return {};
    }
}

async function currentHash(platform) {
    if (!PLATFORMS.includes(platform)) {
        console.error(
            `Plateforme inconnue "${platform}" (attendu : ${PLATFORMS.join(", ")})`,
        );
        process.exit(1);
    }
    const fingerprint = await createFingerprintAsync(".", {
        platforms: [platform],
    });
    return fingerprint.hash;
}

const [command, platform, hash] = process.argv.slice(2);

switch (command) {
    case "hash":
        console.log(await currentHash(platform));
        break;

    case "check": {
        const state = await readState();
        process.exit(state[platform] === hash ? 0 : 1);
    }

    case "save": {
        const state = await readState();
        state[platform] = hash;
        await mkdir(STATE_DIR, { recursive: true });
        await writeFile(STATE_FILE, `${JSON.stringify(state, null, 4)}\n`);
        break;
    }

    case "report": {
        const state = await readState();
        const built = PLATFORMS.filter((p) => state[p]);
        if (built.length === 0) {
            console.log(
                "Aucun development build enregistré : lance `task build:android` (ou build:ios) et installe-le sur ton téléphone.",
            );
            break;
        }
        const hashes = await Promise.all(built.map(currentHash));
        built.forEach((p, i) => {
            console.log(
                state[p] === hashes[i]
                    ? `✔ Build ${p} à jour.`
                    : `⚠ Code natif modifié depuis le dernier build ${p} : lance \`task build:${p}\` puis réinstalle-le.`,
            );
        });
        break;
    }

    default:
        console.error(`Commande inconnue : ${command ?? "(aucune)"}`);
        process.exit(1);
}
