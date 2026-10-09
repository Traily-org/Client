# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

> Guide de contexte du repo `Client` de Traily, pour les agents IA et les développeurs de l'équipe.
> État vérifié le **09/10/2026** sur `develop` (`bb0e7cd`), `chore/frontend-ci` (`b64553d`), `feat/map` (`2cc61ec`) et `chore/frontend-docker` (`e108fd7`).
> Analyse complète et preuves : [doc/](doc/). **Mettre à jour « État actuel » et « Branches » après chaque merge dans `develop`.** Pour les autres repos, ne décrire que leur rôle et leur fonctionnement : leur état d'avancement se consulte directement dans ces repos.

## Traily en bref

Application mobile (iOS/Android) de randonnée gamifiée centrée sur la découverte naturaliste. L'utilisateur suit sa trace GPS et photographie les espèces rencontrées, que l'IA identifie. Ses photos alimentent ses collections façon « Pokédex » (herbier, bestiaire) et lui rapportent points et badges, avec des classements par trace, région et équipe. S'y ajoutent équipes/clans, modération communautaire et un cadre éthique (zones protégées, alertes). Projet Epitech MSc2, organisation GitHub `Traily-org`, multi-repo :

| Repo                              | Rôle                                                                                                                                       |
| --------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| `Client` (ici)                    | app mobile Expo / React Native, seul client de la plateforme                                                                               |
| `backend` (anciennement `Server`) | API REST Go (Gin, architecture hexagonale) sur PostgreSQL + PostGIS : auth, données, logique métier. Seul point d'entrée du mobile         |
| `IA`                              | micro-services IA (Go et Python/FastAPI) : identification d'espèces, analyse de traces, recommandations. Appelés uniquement par le backend |
| `Docs`                            | documents de cadrage : produit, architecture, organisation, process, qualité. Ils font foi en cas de divergence                            |

Contexte métier, architecture et organisation : [doc/project-overview.md](doc/project-overview.md).

## Rôle de ce repo

Unique client de la plateforme : UI, fonctions natives (GPS foreground/background, caméra, stockage local), mode hors connexion et consommation de l'API Go. Règles d'architecture (ARCHITECTURE.md) :

- le mobile ne parle **qu'à l'API Go** (`/api/v1/...`, `Authorization: Bearer <jwt>`), jamais directement aux services IA ;
- réponses API : `{ "data": ... }` ou `{ "error": { "code", "message" } }`, dates ISO 8601 UTC, IDs UUID v4 ;
- access token (15 min) + refresh token (30 j) stockés **uniquement** dans `expo-secure-store` ;
- photos envoyées directement vers S3/MinIO via une URL présignée fournie par l'API (le backend ne sert pas de proxy) ;
- offline critique (zones sans réseau) : cache SQLite + file d'actions rejouée à la reconnexion.

## Où se trouve le code

- Racine git = ce dossier. **L'app Expo est dans `traily-client/` : toutes les commandes pnpm/expo se lancent depuis ce sous-dossier.**
- Branche de travail : **`develop`**.
- `traily-client/CLAUDE.md` importe `AGENTS.md` : Expo SDK 57 a changé, lire https://docs.expo.dev/versions/v57.0.0/ avant d'écrire du code Expo. Ne pas se fier à la mémoire pour les API Expo / Expo Router. Exemple : `Tabs` importé depuis `expo-router` est déprécié en v57 (→ `expo-router/js-tabs`, `expo-router/tabs` ou `expo-router/unstable-native-tabs`), alors que `Stack.Protected` et l'export `ErrorBoundary` des routes existent.
- `traily-client/.claude/settings.json` active le plugin Claude Code `expo` : lancer Claude Code depuis `traily-client/` pour en bénéficier.

## Stack

| Domaine                             | Choix (versions de `package.json`)                                                                                                                                       |
| ----------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Framework                           | Expo SDK 57 (`expo ~57.0.22`), React Native 0.86.3, React 19.2.3                                                                                                         |
| Navigation                          | Expo Router 57 (routage par fichiers) ; `typedRoutes` et `reactCompiler` activés dans `app.json`                                                                         |
| Langage                             | TypeScript ~6.0.3, `strict: true`, alias `@/*` → `src/*`                                                                                                                 |
| Styles                              | NativeWind 4.2.6 + Tailwind 3.4 (`className`) ; tokens `src/constants/theme.ts` lus via `useTheme()`                                                                     |
| Carte (`feat/map`)                  | `@maplibre/maplibre-react-native` 11 (natif), `maplibre-gl` 6 (web), `pmtiles` 4 (tuiles vectorielles Protomaps) ; tuiles raster Esri pour les modes satellite et relief |
| Qualité                             | ESLint (flat config `eslint-config-expo`), Prettier 3 + `prettier-plugin-tailwindcss`, Vitest 5 (`chore/frontend-ci`)                                                    |
| Paquets                             | pnpm uniquement (`packageManager: pnpm@10.13.1` sur `chore/frontend-ci`)                                                                                                 |
| Dev local (`chore/frontend-docker`) | Docker (`node:22-alpine`, Metro sur le port 8081) + Taskfile (go-task)                                                                                                   |
| Prévus (ADR), pas encore installés  | Zustand, expo-location + expo-task-manager, expo-camera, expo-image-picker, expo-sqlite, expo-secure-store, expo-network                                                 |

## Commandes

Depuis `traily-client/` :

```bash
pnpm install
pnpm start                  # Metro ; Expo Go possible tant qu'aucun module natif custom n'est ajouté
pnpm android | pnpm ios     # ouvre sur émulateur / simulateur
pnpm web                    # sur feat/map : lance aussi le proxy CORS PMTiles (port 8082)
pnpm lint                   # ESLint (plante avec ESLint 10, corrigé sur chore/frontend-ci)
pnpm format                 # Prettier --write ; `pnpm format:check` = version CI
pnpm expo install --check   # aligne les versions sur le SDK 57 (--fix pour corriger)
npx expo-doctor@latest      # diagnostic config + dépendances

# disponibles après le merge de chore/frontend-ci
pnpm typecheck              # tsc --noEmit ; lancer `pnpm start` une fois avant (génère expo-env.d.ts)
pnpm test                   # vitest run (passWithNoTests)
pnpm vitest run src/chemin/fichier.test.ts   # un seul fichier
pnpm vitest run -t "nom du test"             # un seul test
pnpm test:coverage

# disponibles après le merge de chore/frontend-docker (sans Node ni pnpm sur le poste)
cp .env.example .env        # renseigner REACT_NATIVE_PACKAGER_HOSTNAME (IP LAN du poste)
docker compose up --build   # Metro dans un conteneur, sources montées (hot reload)
task docker:dev             # idem avec go-task ; `task --list` pour les autres tâches
```

Après le merge de `feat/map`, la carte native exige un **development build** (module natif MapLibre, incompatible avec Expo Go) : `pnpm expo run:android` / `pnpm expo run:ios`, après avoir défini `ios.bundleIdentifier` et `android.package` dans `app.json`. Le conteneur Docker peut toujours servir Metro, mais son flux documenté (Expo Go sur téléphone) n'affiche plus la carte. Variable requise dans `traily-client/.env` : `EXPO_PUBLIC_PM_TILES_URL` (URL d'un fichier `.pmtiles`), à ajouter au `.env.example` créé par `chore/frontend-docker`.

## Architecture du code

Structure de `develop` + `feat/map` + `chore/frontend-docker` :

```
traily-client/
  app/                         # routes Expo Router
    _layout.tsx                # layout racine : ThemeProvider + navigator (doit rendre <Slot/>/<Stack/>)
    index.tsx                  # accueil (placeholder) ; feat/map : liens vers /map et /credits
    map.tsx                    # feat/map : écran carte
    credits.tsx                # feat/map : attributions des sources de la carte
    auth/                      # _layout (Stack sans header), login, register : placeholders
  src/
    features/<feature>/        # code par fonctionnalité ; map/ implémenté, auth/ et profile/ = fichiers vides
    constants/theme.ts         # Colors light/dark, Fonts, Spacing
    constants/config.ts        # vide (prévu : URLs, timeouts)
    hooks/                     # use-color-scheme(.web).ts, use-theme.ts
    global.css                 # directives Tailwind + variables de polices web
  scripts/                     # feat/map : dev-web.mjs, pmtiles-dev-proxy.mjs (web uniquement)
  Dockerfile, docker-compose.yml, Taskfile.yml, .env.example   # chore/frontend-docker
```

Ce qui demande de lire plusieurs fichiers :

- **Découpage par feature** : chaque `src/features/<feature>/` expose son API via `index.ts` (`@/features/map` → `TrailyMap`, `getMapStyle`, `getAllAttributions`, type `MapMode`). Ce découpage s'écarte de la structure par couches du Quality Plan (`src/components|services|store|lib`). Décision à documenter (voir roadmap).
- **Variantes de plateforme** : Metro charge `X.web.tsx` sur web et `X.tsx` sur natif. `TrailyMap` utilise MapLibre Native d'un côté et `maplibre-gl` dans une `div` de l'autre. Les deux fichiers doivent exporter la même API ; `MapModeSwitcher` est commun aux deux.
- **Carte** : `getMapStyle(mode, url)` (`src/features/map/style/map-styles.ts`) renvoie l'un des trois styles : `trail` (`traily-style.json`, vectoriel Protomaps), `satellite` et `topo` (tuiles raster Esri ArcGIS + couches Protomaps). Il y injecte l'URL `pmtiles://…` et un tracé de démo (source GeoJSON `route`). La carte n'affiche aucune attribution : l'écran `/credits` les liste via `getAllAttributions()`, donc toute nouvelle source doit renseigner son champ `attribution`. Sur web, `build.protomaps.com` n'envoie pas d'en-têtes CORS : il faut le proxy local `scripts/pmtiles-dev-proxy.mjs` (port 8082 codé en dur) et le worker `maplibre-gl` chargé depuis jsDelivr. Le web ne sert donc qu'au développement.
- **Styles** : NativeWind n'injecte les classes que si un module de l'app importe `src/global.css` (fichier `input` de `metro.config.js`). Sur `develop`, seul `theme.ts` l'importe, et aucune route n'importe `theme.ts` : les classes ne sont pas chargées. `feat/map` corrige ce point en important `@/global.css` dans `app/_layout.tsx`. Les couleurs de `theme.ts` ne sont pas exposées à Tailwind (`theme.extend` vide).
- **Splash** : `app/_layout.tsx` appelle `SplashScreen.preventAutoHideAsync()` mais jamais `hideAsync()`. D'après la doc de l'API (SDK 57), le splash natif reste alors affiché sur iOS/Android. Appeler `SplashScreen.hideAsync()` une fois l'UI prête.
- **Env** : seules les variables `EXPO_PUBLIC_*` sont exposées au bundle (`process.env.EXPO_PUBLIC_...`). `.env` est ignoré par git (règle `*.env` du `.gitignore` racine). Le premier `.env.example` arrive avec `chore/frontend-docker`.

## Conventions

- **TypeScript** : strict, pas de `any` (`unknown` + type guards), `interface` pour les props et contrats publics, `type` pour les unions et alias. `no-explicit-any` n'est pas activé par `eslint-config-expo` : l'ajouter dans `eslint.config.js`.
- **Formatage** (Prettier, bloquant en CI) : 4 espaces, guillemets doubles, point-virgule, virgules finales, 80 colonnes, classes Tailwind triées par le plugin. `pnpm format` avant de committer.
- **Responsabilités** (Quality Plan) : composants = affichage, aucun appel API ; hooks = orchestration état + services, pas de JSX ; services = logique métier / API / natif, pas d'état React ; store Zustand = état global partagé, pas de logique métier.
- **Natif** : logique GPS dans un service de localisation, caméra dans un service photo (compression qualité 0.7, 1920 px max). Permissions demandées explicitement. Jamais de token ni de coordonnées précises dans les logs.
- **React Compiler** activé : respecter les Rules of React ; `useMemo`/`useCallback` manuels rarement nécessaires.
- **Nommage constaté** : hooks et utilitaires en kebab-case (`use-theme.ts`, `map-styles.ts`), composants de feature en PascalCase (`TrailyMap.tsx`, `MapModeSwitcher.tsx`). Convention mixte à harmoniser. Textes UI en français, code et commentaires en anglais.
- **Git** (détail : [CONTRIBUTING.md](CONTRIBUTING.md)) : Conventional Commits (`feat:`, `fix:`, `chore:`, `docs:`, `test:`), description en anglais à l'impératif et en minuscules, ex. `feat: add map screen`. Branches `feat/ fix/ chore/ docs/ test/ hotfix/` + ticket Linear (équipe `TRA`), ex. `feat/TRA-42-map-screen`. 1 ticket = 1 branche = 1 PR. **Brancher depuis `develop` et ouvrir la PR vers `develop`** (1 approbation, squash uniquement : le titre de la PR devient le message du commit, il suit donc la même convention). `main` n'accepte que des PR depuis `develop`. Capture ou vidéo dans les PR UI.
- **Definition of Done** : exigences du ticket couvertes, CI verte, tests si nécessaire, revue par un membre, doc à jour, testé en environnement de dev.

## État actuel (09/10/2026)

- **Implémenté sur `develop`** : squelette Expo Router, écrans placeholder (accueil, `auth/login`, `auth/register`), thème light/dark (non branché).
- **En attente sur des branches sans PR** : carte MapLibre à trois modes (sentier, satellite, relief) avec un tracé et un marqueur de démo, et écran crédits (`feat/map`) ; CI GitHub Actions (`chore/frontend-ci`) ; environnement Docker de dev (`chore/frontend-docker`).
- **Absent** : navigation (onglets, garde d'auth), client API, état global, auth, GPS, caméra, offline, tests. Le dossier `assets/` (icônes et splash référencés par `app.json`) n'a jamais été commité.
- **Vérifications** (détail : [doc/client-analysis.md](doc/client-analysis.md)) :

| Check                                         | `develop`            | `chore/frontend-ci` | `develop` + CI + carte `521b6e9` (simulé)         |
| --------------------------------------------- | -------------------- | ------------------- | ------------------------------------------------- |
| `tsc --noEmit`, checkout propre (comme en CI) | ❌ TS2882            | ❌ TS2882           | ❌ 2 × TS2882                                     |
| `tsc --noEmit` avec `expo-env.d.ts`           | ✅                   | ✅                  | ✅                                                |
| ESLint                                        | ❌ crash (ESLint 10) | ✅                  | ✅                                                |
| Prettier                                      | ❌ 13 fichiers       | ✅                  | ✅                                                |
| Vitest                                        | pas configuré        | ✅ (0 test)         | ✅ (0 test)                                       |
| expo-doctor                                   | non lancé            | non lancé           | ❌ assets manquants, 4 paquets en retard de patch |

TS2882 : TypeScript 6 refuse un import de CSS non typé (`import "@/global.css"`) tant que `expo-env.d.ts` n'existe pas. Ce fichier est généré par `expo start` et ignoré par git. La dernière colonne a été mesurée avant les deux derniers commits de `feat/map` : à refaire après son rebase.

## Branches

| Branche                            | Rôle                                                                   | État                                                                                                                                               | À faire                                                                                                  |
| ---------------------------------- | ---------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------- |
| `main`                             | releases (branche par défaut)                                          | 1 commit de retard sur `develop` ; importe des `@/components/*` inexistants, ne compile pas                                                        | ne pas en partir ; resynchroniser par PR `develop` → `main` une fois `develop` stable                    |
| `develop`                          | intégration, base de travail                                           | contient la PR #1 squashée (`bb0e7cd`)                                                                                                             | brancher ici                                                                                             |
| `feat/init-project`                | source de la PR #1                                                     | contenu identique à `develop`                                                                                                                      | obsolète, supprimable après accord de l'équipe                                                           |
| `feat/init-docs-and-archi` (Yohan) | documentation du repo : `CLAUDE.md`, `doc/`, README, `CONTRIBUTING.md` | docs de contexte et conventions de contribution                                                                                                    | ouvrir la PR vers `develop`                                                                              |
| `chore/frontend-ci` (Florian)      | CI front + outillage (ESLint 9, Prettier appliqué, Vitest)             | +3 commits, **aucune PR**, CI jamais exécutée ; tous les jobs échoueraient (`pnpm/action-setup` sans version + TS2882)                             | corriger puis merger **en premier**                                                                      |
| `chore/frontend-docker` (Florian)  | Docker + Taskfile pour le dev local                                    | +5 commits, **aucune PR** ; fusion sans conflit avec la CI et la carte ; `Taskfile.yml` (indenté à 2 espaces) échouera au `format:check` de la CI  | `pnpm format`, ouvrir la PR ; au merge de la carte, ajouter `EXPO_PUBLIC_PM_TILES_URL` au `.env.example` |
| `feat/map` (Lucas)                 | carte MapLibre + PMTiles, écran crédits                                | +3 commits (dernier le 21/09), **aucune PR** ; conflits avec la CI sur `app/index.tsx` et `pnpm-lock.yaml` (reformaté par Prettier des deux côtés) | rebaser après la CI, compléter `.env.example`, ouvrir la PR                                              |

Simuler une fusion sans toucher au working tree : `git merge-tree --write-tree --name-only origin/<a> origin/<b>`.

## Recommandations (ordre conseillé)

1. **Débloquer la CI** (`chore/frontend-ci`) : `with: package_json_file: traily-client/package.json` sur chaque `pnpm/action-setup`, créer `expo-env.d.ts` avant `tsc` (ou déclarer `*.css`). PR vers `develop`, puis rendre les 4 checks obligatoires dans le ruleset GitHub.
2. **Intégrer `chore/frontend-docker`** : passer `pnpm format` (pour `Taskfile.yml`), puis PR vers `develop`. Aucun conflit avec les autres branches.
3. **Intégrer `feat/map`** : rebase sur `develop` ; dans `app/index.tsx`, garder les `Link` et retirer `StyleSheet` ; régénérer le lockfile avec `pnpm install`, jamais à la main. Ajouter `EXPO_PUBLIC_PM_TILES_URL` au `.env.example`, aligner `MIN_ZOOM` (12) et le zoom initial (11), valider les conditions d'utilisation des tuiles Esri (satellite, relief).
4. **Corriger les bloquants runtime** : `SplashScreen.hideAsync()`, import de `global.css` dans le layout racine (fait sur `feat/map`), commit de `assets/` (ou nettoyage d'`app.json`).
5. **Hygiène** : `.gitattributes` (`* text=auto eol=lf`), remplacer le `.gitignore` racine (template Visual Studio), remplir le placeholder `allowBuilds` de `pnpm-workspace.yaml`, `pnpm expo install --fix`, README de `traily-client/`, script `reset-project` orphelin.
6. **Fondations** : navigation (onglets + `Stack.Protected` pour l'auth), tokens de thème dans Tailwind, client API typé avec mocks (en attendant les endpoints nécessaires côté backend), Zustand + `expo-secure-store`, choix du lanceur de tests (Jest + `jest-expo` recommandé pour les composants : Quality Plan, preset du SDK, et `expo-router/testing-library` repose sur `jest` ; Vitest en `node` ne couvre que les fonctions pures), dev build / EAS. Installer les modules Expo avec `pnpm expo install <paquet>`.
7. **Features MVP** (backlog `Must`) : GPS et traces, photo géolocalisée, collections, profil. Voir [doc/frontend-roadmap.md](doc/frontend-roadmap.md).

## Pièges connus

- Conflit sur `pnpm-lock.yaml` : garder une version puis relancer `pnpm install`. Sur `chore/frontend-ci` comme sur `feat/map`, le lockfile a été reformaté par Prettier (seule la CI l'exclut ensuite via `.prettierignore`).
- ESLint doit rester en v9 tant que `eslint-plugin-react` (tiré par `eslint-config-expo` 57) ne supporte pas la v10 (erreur `contextOrFilename.getFilename is not a function`).
- Pas de `.gitattributes` : sous Windows avec `core.autocrlf=true`, des fichiers en CRLF font échouer `prettier --check`, qui attend `lf`.
- Le `.gitignore` racine (template Visual Studio) ignore `packages/`, `logs/`, `out/`, `debug/`, `release/`, `bin/`, `artifacts/`, `Backup*/`… Si un dossier n'apparaît pas dans `git status` : `git check-ignore -v <chemin>`.
- Sous Windows, cloner le repo dans un chemin court : au-delà de 260 caractères, la résolution ESM de Node échoue dans `node_modules/.pnpm` (constaté : Vitest `ERR_PACKAGE_IMPORT_NOT_DEFINED`).
- Port 8081 : Metro l'utilise, et le conteneur Docker du client le publie. Si une autre stack locale (backend compris) occupe déjà ce port, changer le port publié d'un côté.
- Les règles GitHub imposent le squash merge : après une release `develop` → `main`, resynchroniser `main` dans `develop` pour éviter des conflits à la release suivante.
- Coordonnées : MapLibre et GeoJSON utilisent `[lng, lat]`, alors que l'API prévue prend `near=<lat,lng>`. Centraliser la conversion.
