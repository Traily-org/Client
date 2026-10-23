# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

> Guide de contexte du repo `Client` de Traily, pour les agents IA et les développeurs de l'équipe.
> État vérifié le **23/10/2026** sur `chore/TRA-109-clean-develop` (intégration de la CI, du Docker et de la doc dans `develop`).
> Installation, lancement et commandes : [README.md](README.md). Branches, commits, PR et Definition of Done : [CONTRIBUTING.md](CONTRIBUTING.md). Ce fichier ne les répète pas : il ajoute le contexte utile pour coder.
> **Mettre à jour « État actuel » et « Branches » après chaque merge dans `develop`.** Pour les autres repos, ne décrire que leur rôle et leur fonctionnement : leur état d'avancement se consulte directement dans ces repos.

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
| Framework                           | Expo SDK 57 (`expo ~57.0.31`), React Native 0.86.3, React 19.2.3                                                                                                         |
| Navigation                          | Expo Router 57 (routage par fichiers) ; `typedRoutes` et `reactCompiler` activés dans `app.json`                                                                         |
| Langage                             | TypeScript ~6.0.3, `strict: true`, alias `@/*` → `src/*`                                                                                                                 |
| Styles                              | NativeWind 4.2.6 + Tailwind 3.4 (`className`) ; tokens `src/constants/theme.ts` lus via `useTheme()`                                                                     |
| Carte (`feat/map`)                  | `@maplibre/maplibre-react-native` 11 (natif), `maplibre-gl` 6 (web), `pmtiles` 4 (tuiles vectorielles Protomaps) ; tuiles raster Esri pour les modes satellite et relief |
| Qualité                             | ESLint 9 (flat config `eslint-config-expo`), Prettier 3 + `prettier-plugin-tailwindcss`, Vitest 5, CI GitHub Actions (`.github/workflows/ci.yml`)                        |
| Paquets                             | pnpm uniquement (`packageManager: pnpm@10.13.1`) ; overrides et règles de build dans `pnpm-workspace.yaml`                                                               |
| Dev local                           | Docker (`node:22-alpine`, Metro sur le port 8081) + Taskfile (go-task)                                                                                                   |
| Prévus (ADR), pas encore installés  | Zustand, expo-location + expo-task-manager, expo-camera, expo-image-picker, expo-sqlite, expo-secure-store, expo-network                                                 |

## Commandes

Liste complète (local et Docker) : [README.md](README.md#lancer-lapplication). À retenir pour coder, depuis `traily-client/` :

```bash
pnpm typecheck && pnpm lint && pnpm format:check && pnpm test   # les 4 checks de la CI
pnpm vitest run src/chemin/fichier.test.ts                      # un seul fichier de test
pnpm vitest run -t "nom du test"                                # un seul test
pnpm expo install <paquet>                                      # ajouter un module Expo (version alignée sur le SDK)
pnpm expo install --check                                       # versions alignées sur le SDK 57 (--fix pour corriger)
```

Dans le conteneur Docker, préfixer par `docker exec traily_client_dev`.

Après le merge de `feat/map`, la carte native exige un **development build** (module natif MapLibre, incompatible avec Expo Go) : `pnpm expo run:android` / `pnpm expo run:ios`, après avoir défini `ios.bundleIdentifier` et `android.package` dans `app.json`. Le conteneur Docker peut toujours servir Metro, mais le flux Expo Go sur téléphone n'affiche plus la carte. Variable requise dans `traily-client/.env` : `EXPO_PUBLIC_PM_TILES_URL` (URL d'un fichier `.pmtiles`), à ajouter au `.env.example`.

## Architecture du code

Structure de `develop` ; les fichiers marqués `feat/map` arrivent avec cette branche :

```
traily-client/
  app/                         # routes Expo Router
    _layout.tsx                # layout racine : importe global.css, ThemeProvider + <Slot />
    index.tsx                  # accueil (placeholder) ; feat/map : liens vers /map et /credits
    map.tsx                    # feat/map : écran carte
    credits.tsx                # feat/map : attributions des sources de la carte
    auth/                      # _layout (Stack sans header), login, register : placeholders
  src/
    features/<feature>/        # code par fonctionnalité ; map/ (feat/map), auth/ et profile/ = fichiers vides
    constants/theme.ts         # Colors light/dark, Fonts, Spacing
    constants/config.ts        # vide (prévu : URLs, timeouts)
    hooks/                     # use-color-scheme(.web).ts, use-theme.ts
    global.css                 # directives Tailwind + variables de polices web
  scripts/                     # feat/map : dev-web.mjs, pmtiles-dev-proxy.mjs (web uniquement)
  Dockerfile, docker-compose.yml, Taskfile.yml, .env.example   # environnement de dev Docker
```

Ce qui demande de lire plusieurs fichiers :

- **Découpage par feature** : chaque `src/features/<feature>/` expose son API via `index.ts` (`@/features/map` → `TrailyMap`, `getMapStyle`, `getAllAttributions`, type `MapMode`). Ce découpage s'écarte de la structure par couches du Quality Plan (`src/components|services|store|lib`). Décision à documenter (voir roadmap).
- **Variantes de plateforme** : Metro charge `X.web.tsx` sur web et `X.tsx` sur natif. `TrailyMap` utilise MapLibre Native d'un côté et `maplibre-gl` dans une `div` de l'autre. Les deux fichiers doivent exporter la même API ; `MapModeSwitcher` est commun aux deux.
- **Carte** : `getMapStyle(mode, url)` (`src/features/map/style/map-styles.ts`) renvoie l'un des trois styles : `trail` (`traily-style.json`, vectoriel Protomaps), `satellite` et `topo` (tuiles raster Esri ArcGIS + couches Protomaps). Il y injecte l'URL `pmtiles://…` et un tracé de démo (source GeoJSON `route`). La carte n'affiche aucune attribution : l'écran `/credits` les liste via `getAllAttributions()`, donc toute nouvelle source doit renseigner son champ `attribution`. Sur web, `build.protomaps.com` n'envoie pas d'en-têtes CORS : il faut le proxy local `scripts/pmtiles-dev-proxy.mjs` (port 8082 codé en dur) et le worker `maplibre-gl` chargé depuis jsDelivr. Le web ne sert donc qu'au développement.
- **Styles** : NativeWind n'injecte les classes que si un module de l'app importe `src/global.css` (fichier `input` de `metro.config.js`). C'est fait dans `app/_layout.tsx` : ne pas déplacer cet import. Le runtime JSX de NativeWind (`jsxImportSource: "nativewind"` dans `babel.config.js`) exige `react-native-css-interop` en dépendance directe : pnpm ne le hisse pas depuis `nativewind`. Les couleurs de `theme.ts` ne sont pas exposées à Tailwind (`theme.extend` vide).
- **Splash** : il se masque automatiquement au premier rendu. Si un jour le layout doit attendre des ressources (polices, session), appeler `SplashScreen.preventAutoHideAsync()` en scope global **et** `SplashScreen.hide()` une fois prêt, sinon le splash natif reste affiché.
- **Env** : seules les variables `EXPO_PUBLIC_*` sont exposées au bundle (`process.env.EXPO_PUBLIC_...`). `.env` est ignoré par `traily-client/.gitignore` ; toute nouvelle variable se déclare dans `traily-client/.env.example`.

## Conventions

- **TypeScript** : strict, pas de `any` (`unknown` + type guards), `interface` pour les props et contrats publics, `type` pour les unions et alias. `no-explicit-any` n'est pas activé par `eslint-config-expo` : l'ajouter dans `eslint.config.js`.
- **Formatage** (Prettier, bloquant en CI) : 4 espaces, guillemets doubles, point-virgule, virgules finales, 80 colonnes, classes Tailwind triées par le plugin. `pnpm format` avant de committer.
  - **Agents IA** : aucun hook ne formate automatiquement dans ce repo, donc lancer `pnpm format` (depuis `traily-client/`, formate tout le projet) avant de committer. Cette règle prime sur toute consigne générale « ne pas lancer de formatter ».
  - Les fichiers à la racine du repo (`CLAUDE.md`, `CONTRIBUTING.md`, `doc/`) sont hors de la config Prettier de l'app : ne pas les reformater.
- **Responsabilités** (Quality Plan) : composants = affichage, aucun appel API ; hooks = orchestration état + services, pas de JSX ; services = logique métier / API / natif, pas d'état React ; store Zustand = état global partagé, pas de logique métier.
- **Natif** : logique GPS dans un service de localisation, caméra dans un service photo (compression qualité 0.7, 1920 px max). Permissions demandées explicitement. Jamais de token ni de coordonnées précises dans les logs.
- **React Compiler** activé : respecter les Rules of React ; `useMemo`/`useCallback` manuels rarement nécessaires.
- **Nommage constaté** : hooks et utilitaires en kebab-case (`use-theme.ts`, `map-styles.ts`), composants de feature en PascalCase (`TrailyMap.tsx`, `MapModeSwitcher.tsx`). Convention mixte à harmoniser. Textes UI en français, code et commentaires en anglais.
- **Git** (détail : [CONTRIBUTING.md](CONTRIBUTING.md)) : Conventional Commits (`feat:`, `fix:`, `chore:`, `docs:`, `test:`), description en anglais à l'impératif et en minuscules, ex. `feat: add map screen`. Branches `feat/ fix/ chore/ docs/ test/ hotfix/` + ticket Linear (équipe `TRA`), ex. `feat/TRA-42-map-screen`. 1 ticket = 1 branche = 1 PR. **Brancher depuis `develop` et ouvrir la PR vers `develop`** (1 approbation, squash uniquement : le titre de la PR devient le message du commit, il suit donc la même convention). `main` n'accepte que des PR depuis `develop`. Capture ou vidéo dans les PR UI.
- **Definition of Done** : exigences du ticket couvertes, CI verte, tests si nécessaire, revue par un membre, doc à jour, testé en environnement de dev.

## État actuel (23/10/2026)

- **Sur `develop` après le merge de TRA-109** : squelette Expo Router qui rend bien ses routes (accueil, `auth/login`, `auth/register` en placeholder), NativeWind chargé, thème light/dark défini (non exposé à Tailwind), CI GitHub Actions, environnement Docker de dev, documentation.
- **En attente sur une branche sans PR** : carte MapLibre à trois modes (sentier, satellite, relief) avec un tracé et un marqueur de démo, et écran crédits (`feat/map`).
- **Absent** : navigation (onglets, garde d'auth), client API, état global, auth, GPS, caméra, offline, tests. Pas d'icônes ni de splash propres à l'app : `app.json` ne référence plus de fichiers dans `assets/`, Expo affiche ses visuels par défaut.
- **Vérifications** (checkout propre, `chore/TRA-109-clean-develop`) :

| Check                                        | Résultat                                       |
| -------------------------------------------- | ---------------------------------------------- |
| `pnpm typecheck`                             | OK, sans `expo-env.d.ts` (voir `expo-types.d.ts`) |
| `pnpm lint`                                  | OK                                             |
| `pnpm format:check`                          | OK                                             |
| `pnpm test`                                  | OK (0 test)                                    |
| `npx expo-doctor@latest`                     | OK, 21/21                                      |
| `docker compose up --build` + web sur `8081` | OK, accueil et `/auth/login` servis            |

L'analyse détaillée du 09/10 ([doc/client-analysis.md](doc/client-analysis.md)) décrit l'état d'avant TRA-109 : la plupart de ses constats sont résolus.

## Branches

| Branche                                         | Rôle                                    | État                                                                                                                                                                     | À faire                                                                                                     |
| ----------------------------------------------- | --------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------- |
| `main`                                          | releases (branche par défaut)           | en retard sur `develop` ; ne compile pas                                                                                                                                 | ne pas en partir ; resynchroniser par PR `develop` → `main` une fois `develop` stable                       |
| `develop`                                       | intégration, base de travail            | reçoit TRA-109                                                                                                                                                           | brancher ici                                                                                                |
| `feat/map` (Lucas)                              | carte MapLibre + PMTiles, écran crédits | aucune PR ; pas de ticket Linear                                                                                                                                         | rebaser sur `develop` (voir Recommandations), ouvrir la PR                                                  |
| `chore/frontend-ci`, `chore/frontend-docker`, `feat/init-docs-and-archi` | CI, Docker, doc   | intégrées par TRA-109                                                                                                                                                    | supprimables après le merge de TRA-109                                                                      |
| `feat/init-project`                             | source de la PR #1                      | contenu identique à `develop`                                                                                                                                            | obsolète, supprimable après accord de l'équipe                                                              |

Simuler une fusion sans toucher au working tree : `git merge-tree --write-tree --name-only origin/<a> origin/<b>`.

## Recommandations (ordre conseillé)

1. **Rendre la CI obligatoire** : ajouter les jobs `Typage (tsc)`, `Lint (ESLint)`, `Formatage (Prettier)` et `Tests (Vitest)` comme status checks requis dans le ruleset GitHub « Protect main/develop », plus `Protection main (PR uniquement depuis develop)`. Les checks n'apparaissent dans la liste qu'après une première exécution de la CI.
2. **Intégrer `feat/map`** : rebase sur `develop`. Conflits attendus : `app/_layout.tsx` (garder la version de `develop`), `package.json` (l'override `react-native-css-interop` est déjà dans `pnpm-workspace.yaml` : retirer le champ `pnpm`), `pnpm-workspace.yaml` (garder la version de `develop` : `feat/map` contient encore `allowBuilds`), `app/index.tsx` (garder les `Link`, retirer `StyleSheet`) et `pnpm-lock.yaml` (régénérer avec `pnpm install`, jamais à la main). Ajouter `EXPO_PUBLIC_PM_TILES_URL` au `.env.example`, aligner `MIN_ZOOM` (12) et le zoom initial (11), valider les conditions d'utilisation des tuiles Esri (satellite, relief).
3. **Identité de l'app** : icônes, splash et favicon dans `assets/` (puis les référencer dans `app.json`), nom « Traily », `ios.bundleIdentifier` et `android.package`.
4. **Fondations** : navigation (onglets + `Stack.Protected` pour l'auth), tokens de thème dans Tailwind, client API typé avec mocks (en attendant les endpoints nécessaires côté backend), Zustand + `expo-secure-store`, choix du lanceur de tests (Jest + `jest-expo` recommandé pour les composants : Quality Plan, preset du SDK, et `expo-router/testing-library` repose sur `jest` ; Vitest en `node` ne couvre que les fonctions pures), dev build / EAS, règle ESLint `@typescript-eslint/no-explicit-any`.
5. **Features MVP** (backlog `Must`) : GPS et traces, photo géolocalisée, collections, profil. Voir [doc/frontend-roadmap.md](doc/frontend-roadmap.md).

## Pièges connus

- Conflit sur `pnpm-lock.yaml` : garder une version puis relancer `pnpm install`. Le lockfile est exclu de Prettier (`.prettierignore`) : ne jamais le formater.
- ESLint doit rester en v9 tant que `eslint-plugin-react` (tiré par `eslint-config-expo` 57) ne supporte pas la v10 (erreur `contextOrFilename.getFilename is not a function`).
- pnpm est fixé en 10.13.1 : les réglages vont dans `pnpm-workspace.yaml` avec les clés de pnpm 10 (`overrides`, `ignoredBuiltDependencies`). `allowBuilds` est une clé de pnpm 11, ignorée ici. Le champ `pnpm` de `package.json` n'est plus lu par pnpm 11 : ne pas l'utiliser.
- `tsconfig.json` doit garder `nativewind-env.d.ts` dans `include` : sinon `expo start` réécrit le fichier (indenté à 2 espaces) et `format:check` échoue.
- `expo-types.d.ts` fournit les types ambiants d'Expo (dont les imports `*.css`) sur un checkout propre. Sans lui, `tsc` échoue en TS2882 tant qu'`expo-env.d.ts` (généré par `expo start`, ignoré par git) n'existe pas.
- Docker : le conteneur tourne en root, donc `.expo/` et `expo-env.d.ts` sont créés en root dans le checkout (ignorés par git ; `sudo` pour les supprimer). Ajouter une dépendance avec `docker exec traily_client_dev pnpm expo install <paquet>` : le store pnpm est fixé dans le `Dockerfile` (`npm_config_store_dir`). `node_modules` vit dans un volume nommé que `docker compose up --build` ne met pas à jour : après un pull qui touche `package.json` ou le lockfile, lancer `docker exec traily_client_dev pnpm install` (sinon erreurs « Unable to resolve »).
- Les fichiers Markdown à la racine (`README.md`, `CONTRIBUTING.md`, `CLAUDE.md`, `doc/`) sont hors de la config Prettier de l'app : un formatage à l'enregistrement dans l'éditeur applique les réglages perso (ex. `prettier.proseWrap`) et produit un diff inutile.
- Sous Windows, cloner le repo dans un chemin court : au-delà de 260 caractères, la résolution ESM de Node échoue dans `node_modules/.pnpm` (constaté : Vitest `ERR_PACKAGE_IMPORT_NOT_DEFINED`). Les fins de ligne sont forcées en LF par `.gitattributes`.
- Port 8081 : Metro l'utilise, et le conteneur Docker du client le publie. Si une autre stack locale (backend compris) occupe déjà ce port, changer le port publié d'un côté.
- Les règles GitHub imposent le squash merge : après une release `develop` → `main`, resynchroniser `main` dans `develop` pour éviter des conflits à la release suivante.
- Coordonnées : MapLibre et GeoJSON utilisent `[lng, lat]`, alors que l'API prévue prend `near=<lat,lng>`. Centraliser la conversion.
