# Roadmap front-end

> Proposition du 21/09/2026, mise à jour le 09/10/2026. Construite à partir du BACKLOG, de l'OBS, du Quality Plan et de l'état réel du repo ([client-analysis.md](client-analysis.md), section « Branches » de [CLAUDE.md](../CLAUDE.md)).
> Les priorités Must/Should/Could viennent du backlog. L'ordre, le découpage et les choix techniques sont des **recommandations à valider en Sprint Planning**. Les owners indiqués sont les owners par défaut de l'OBS, réassignables.

## Principes

- **Stabiliser avant de construire** : aucune feature tant que la CI n'est pas verte et obligatoire, et que l'app ne démarre pas sur un device.
- **Avancer en parallèle du backend** : contrat d'API d'abord (types + mocks), branchement réel au fur et à mesure que les endpoints arrivent. Vérifier dans le repo `backend` ce qui existe avant de brancher un écran.
- **Penser offline et natif dès le départ** : GPS, photo et synchronisation isolés dans des services testables et mockables, et non ajoutés en fin de parcours.
- **Vérifier toute API Expo dans la doc v57** : `Tabs` importé depuis `expo-router` est par exemple déprécié dans cette version (voir 1.2).

## Phase 0 : stabilisation (immédiat)

> **Statut au 23/10/2026** : TRA-109 réalise 0.1, 0.3 et 0.5, la partie `app.json` de 0.6 (références aux assets manquants retirées) et l'essentiel de 0.7 (`.gitattributes`, `.gitignore` racine, `pnpm-workspace.yaml`, `pnpm expo install --fix`, script `reset-project`, README unique). Restent 0.2, 0.4, le reste de 0.6 (assets, nom, identifiants), la règle `no-explicit-any` de 0.7, 0.8 et 0.9.

| #   | Tâche                                                                                                                                                                                                                                                                                                                                                          | Branche                 | Owner           | Effort |
| --- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------- | --------------- | ------ |
| 0.1 | Corriger la CI : `package_json_file: traily-client/package.json` sur `pnpm/action-setup`, génération d'`expo-env.d.ts` avant le typecheck. Ouvrir la PR vers `develop`.                                                                                                                                                                                        | `chore/frontend-ci`     | Florian         | XS     |
| 0.2 | Ajouter les 4 jobs CI comme status checks obligatoires du ruleset « Protect main/develop »                                                                                                                                                                                                                                                                     | —                       | Florian (admin) | XS     |
| 0.3 | Formater `Taskfile.yml` (`pnpm format`) et ouvrir la PR de l'environnement Docker de dev                                                                                                                                                                                                                                                                       | `chore/frontend-docker` | Florian         | XS     |
| 0.4 | Mettre `feat/map` à jour avec `develop` (conflits `app/index.tsx` + lockfile), ajouter `EXPO_PUBLIC_PM_TILES_URL` au `.env.example` et la section README, aligner `MIN_ZOOM` et le zoom initial, afficher une erreur au lieu de planter si la variable manque, valider les conditions d'utilisation des tuiles Esri (modes satellite et relief). Ouvrir la PR. | `feat/map`              | Lucas           | S      |
| 0.5 | Masquer le splash (`SplashScreen.hideAsync()`) ; importer `@/global.css` dans `app/_layout.tsx` (déjà fait sur `feat/map`)                                                                                                                                                                                                                                     | `fix/…`                 | Lucas           | XS     |
| 0.6 | Commiter les assets (icône, icônes adaptatives Android, splash, favicon, `expo.icon`) ; renommer l'app en « Traily » ; définir `ios.bundleIdentifier` et `android.package`                                                                                                                                                                                     | `chore/…`               | Lucas           | S      |
| 0.7 | Hygiène : `.gitattributes` (`* text=auto eol=lf`), `.gitignore` racine Node/Expo, `allowBuilds` de `pnpm-workspace.yaml`, `pnpm expo install --fix`, suppression du script `reset-project`, README `traily-client/`, règle `@typescript-eslint/no-explicit-any`                                                                                                | `chore/…`               | à définir       | S      |
| 0.8 | Premier dev build Android et iOS (`pnpm expo run:android` / `run:ios`) : valider MapLibre sur RN 0.86                                                                                                                                                                                                                                                          | —                       | Lucas / Maxim   | S      |
| 0.9 | Supprimer `feat/init-project` (après accord) ; release `develop` → `main`, puis resynchroniser `main` dans `develop`                                                                                                                                                                                                                                           | —                       | Florian         | XS     |

**Critère de sortie** : CI verte et obligatoire sur `develop` ; app lancée en dev build sur Android et iOS, avec l'accueil et la carte ; `main` resynchronisé.

## Phase 1 : fondations techniques

### 1.1 Architecture et conventions (à documenter dans le Quality Plan)

Structure hybride proposée, qui prolonge le découpage par feature déjà amorcé :

```
app/                        routes uniquement (écrans minces qui composent les features)
  _layout.tsx               providers, import global.css, hydratation de session, masquage du splash
  (public)/                 login, register, onboarding éthique
  (app)/                    routes réservées aux utilisateurs connectés (garde d'auth)
    (tabs)/                 explorer, carte / enregistrement, collections, profil
src/
  features/<feature>/       components/, hooks/, services/, types.ts, index.ts (API publique)
  components/ui/            design system partagé (Button, Text, Card, Badge, Sheet…)
  lib/                      client API, stockage sécurisé, base SQLite, cache serveur
  store/                    stores Zustand globaux (session, préférences)
  constants/  utils/  types/
```

- Les groupes `(public)` / `(app)` évitent l'ambiguïté du Quality Plan, où `(auth)` désigne les routes _authentifiées_, et de l'actuel `app/auth/`, qui contient login et register.
- Règle de nommage à trancher. Proposition : kebab-case pour tous les fichiers (comme le template Expo et les routes), composants exportés en PascalCase.
- Règles de dépendance : une feature n'importe pas les fichiers internes d'une autre feature, seulement son `index.ts`. `app/` ne contient pas de logique métier.

### 1.2 Navigation

- Layout racine en `Stack`. Groupe `(app)` protégé avec `Stack.Protected guard={isAuthenticated}` (API présente dans expo-router 57.0.21).
- Onglets : l'export `Tabs` d'`expo-router` est **déprécié en v57** (« Use `import { Tabs } from 'expo-router/js-tabs'` »). Le paquet expose aussi `expo-router/tabs` et `expo-router/unstable-native-tabs`. Choisir d'après la doc v57.
- `export function ErrorBoundary` dans les layouts : expo-router 57 l'exporte ; à utiliser pour ne plus planter tout l'écran.

### 1.3 Design system

- Une seule source de vérité pour les tokens : couleurs light/dark, espacements, rayons, typographie, exposés à Tailwind (`theme.extend` ou variables CSS pour le mode sombre).
- Corriger `ThemeColor` (clés identiques en light et dark) et donner à `primaryHover` light une vraie valeur.
- Composants de base dans `src/components/ui/`, avec états `disabled`, `danger` et focus, et accessibilité (libellés, cibles tactiles). Captures light et dark dans les PR.

### 1.4 Couche API

- `src/lib/api/` : client `fetch` (base `EXPO_PUBLIC_API_URL`, timeout), décodage de l'enveloppe `{ data } | { error: { code, message } }` en erreurs typées, injection du Bearer, refresh sur 401 avec mise en file des requêtes concurrentes, aucun token dans les logs.
- DTO et mappers DTO → domaine, testés à 100 % comme le demande le Quality Plan.
- **Mode mock** derrière la même interface de service (ex. `EXPO_PUBLIC_API_MOCK=true`), pour développer sans backend.
- Dès que le backend publie un OpenAPI (Story 8.1), générer les types au lieu de les écrire à la main.

### 1.5 Session et état

- Zustand pour l'état client (session, préférences). Tokens dans `expo-secure-store` (`src/lib/secure-storage.ts`).
- Hydrater la session au démarrage **avant** `SplashScreen.hideAsync()`, pour éviter un flash de l'écran de login.
- Installer les modules avec `pnpm expo install <paquet>` : SDK 57 prévoit notamment `expo-secure-store ~57.0.4`, `expo-sqlite ~57.0.3`, `expo-location ~57.0.17`, `expo-task-manager ~57.0.17`, `expo-camera ~57.0.5`, `expo-image-picker ~57.0.17`, `expo-image-manipulator ~57.0.17`, `expo-network ~57.0.2`, `expo-notifications ~57.0.18`.

### 1.6 Tests

- **Décision à prendre avant les premiers tests de composants** (voir « Décisions ») : le Quality Plan prévoit Jest ; la CI utilise Vitest en environnement `node`.
- Premiers tests quel que soit le choix : `getMapStyle` et `getAllAttributions` (carte), les mappers DTO et les utilitaires géo (distance, dénivelé lissé, simplification de trace), qui sont des fonctions pures.
- Modules natifs mockés, pas de snapshots, `describe` par unité et `it` en langage naturel (Quality Plan).
- E2E (Yohan, OBS) : choisir un outil adapté aux dev builds (à évaluer : Maestro, Detox), puis un premier parcours « lancement → accueil → carte » et un job CI dédié.

### 1.7 Builds

- `eas.json` avec les profils `development`, `preview` et `production` ; compte et projet Expo.
- Job CI `eas build --profile preview` sur `main`, prévu par le Quality Plan et volontairement absent de la CI actuelle.

## Phase 2 : MVP (stories `Must`)

| Bloc                       | Stories           | Travail front                                                                                                                                                                                                                                                                                                                                                                                                      | Modules                                                        | Dépendances backend                                                                                   |
| -------------------------- | ----------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------- |
| **GPS temps réel**         | 1.1               | service de localisation : permissions premier plan puis arrière-plan avec écran d'explication, suivi continu, tâche d'arrière-plan + notification persistante, échantillonnage adaptatif, filtrage des points aberrants. UI : position, polyline live, démarrer / pause / reprendre / arrêter, métriques (distance, vitesse, altitude, durée). Points persistés en SQLite pendant la session (résistance au kill). | `expo-location`, `expo-task-manager`, `expo-sqlite`            | aucune pour l'enregistrement                                                                          |
| **Traces**                 | 1.2, 1.3          | fin de session (résumé, sauvegarde, simplification Douglas-Peucker avant envoi) ; historique ; détail (carte, profil altimétrique, stats, photos) ; exploration autour de soi (liste + carte, pagination) ; filtres en bottom sheet ; badge de difficulté et durée estimée en fourchette                                                                                                                           | lib de graphiques à choisir (ex. basée sur `react-native-svg`) | `POST /trail-sessions`, `GET /trails?near=&radius=`, `GET /trails/:id`, calcul de difficulté côté API |
| **Photo géolocalisée**     | 1.4               | service photo : capture, métadonnées GPS, horodatage et altitude, prévisualisation, compression (qualité 0.7, 1920 px) ; file d'upload hors ligne ; URL présignée → `PUT` → confirmation, avec retries ; pins sur la carte ; galerie chronologique                                                                                                                                                                 | `expo-camera`, `expo-image-picker`, `expo-image-manipulator`   | `POST /trails/:id/photos/upload-url`, `PATCH /photos/:id/confirm`, MinIO                              |
| **Offline et synchro**     | transverse        | détection réseau + bannière ; schéma SQLite (traces consultées, sessions, points, file d'actions) ; moteur de synchro (backoff, idempotence, politique de conflits) ; tests du moteur                                                                                                                                                                                                                              | `expo-network`, `expo-sqlite`                                  | endpoints idempotents                                                                                 |
| **Auth et profil**         | 3.4, 8.1          | login et register (formulaires, validation, erreurs API), déconnexion ; profil : stats de collection, historique trié par date décroissante, édition                                                                                                                                                                                                                                                               | `expo-secure-store`                                            | `/auth/register`, `/auth/login`, `/auth/refresh`, `GET/PUT /users/me`                                 |
| **Espèces et collections** | 2.2, 2.3, 3.1–3.3 | espèces observables par trace ; identification (photo → propositions avec score → choix manuel sous le seuil) ; herbier et bestiaire (grille découvert / verrouillé, % de complétion, filtres et tri sur 100+ espèces) ; fiche espèce (< 2 s)                                                                                                                                                                      | —                                                              | API espèces et identification (via le backend), à définir                                             |

Ordre suggéré : GPS et traces (cœur de l'app, et la carte existe déjà) → auth et profil (débloque la synchro) → photo et offline → espèces et collections. À ajuster selon l'avancement du backend.

## Phase 3 : `Should` / `Could`

- **Gamification** (4.1–4.3) : solde et historique de points, badges et notification de déblocage, classements par trace, région et équipe (podium, position, pagination).
- **Cadre éthique** (7.1–7.3) : couche des zones protégées, alertes de proximité sans doublon, onboarding éthique au premier lancement (accessible depuis les paramètres).
- **Communauté et modération** (5.x, 6.x) : dépend du recrutement des Recrues 1 et 2.
- **Notifications push** : `expo-notifications`.
- **Bonus** (11.x) : hors MVP, à n'ouvrir que sur arbitrage du coordinateur.

## Dépendances vers le backend (par ordre de besoin)

Endpoints prévus par ARCHITECTURE.md, à confirmer avec l'équipe backend. Leur disponibilité se vérifie dans le repo `backend` (puis dans son OpenAPI) au moment de brancher chaque écran.

| Besoin front    | Endpoints prévus                                                                   |
| --------------- | ---------------------------------------------------------------------------------- |
| Contrat commun  | enveloppe `{ data }` / `{ error: { code, message } }`, OpenAPI publié, CORS en dev |
| Auth et profil  | `POST /auth/register`, `/auth/login`, `/auth/refresh`, `GET/PUT /users/me`         |
| Enregistrement  | `POST /trail-sessions`                                                             |
| Exploration     | `GET /trails?near=&radius=` (filtres, pagination), `GET /trails/:id`, waypoints    |
| Photos          | `POST /trails/:id/photos/upload-url`, `PATCH /photos/:id/confirm`, MinIO           |
| Espèces, scores | à spécifier (Stories 2.x, 4.x)                                                     |

## Décisions à prendre

| Décision                  | Options                                                                                                                     | Recommandation                                                                                                                                                                                                                                                                                     |
| ------------------------- | --------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Structure du code         | par couches (Quality Plan) / par feature (code actuel)                                                                      | hybride (1.1), à documenter dans le Quality Plan                                                                                                                                                                                                                                                   |
| Lanceur de tests          | Jest + `jest-expo` (Quality Plan) / Vitest (CI actuelle)                                                                    | pour les composants, hooks et routes : **Jest + `jest-expo`**. C'est le preset du SDK (`jest-expo ~57.0.5`), et les utilitaires `expo-router/testing-library` reposent sur le global `jest`. Vitest en environnement `node` ne couvre que les fonctions pures. Aligner ensuite Quality Plan et CI. |
| Cache des données serveur | fetch + Zustand / TanStack Query                                                                                            | TanStack Query pour le cache, les retries et la persistance offline des lectures ; Zustand pour l'état client                                                                                                                                                                                      |
| Styles                    | NativeWind / `StyleSheet`                                                                                                   | NativeWind par défaut avec les tokens partagés ; `StyleSheet` réservé aux cas natifs ou de performance (marqueurs de carte)                                                                                                                                                                        |
| Nommage des fichiers      | kebab-case / PascalCase pour les composants                                                                                 | kebab-case partout (1.1)                                                                                                                                                                                                                                                                           |
| Groupes de routes         | `(auth)`/`(public)` du Quality Plan / `app/auth/` actuel                                                                    | `(public)` + `(app)` avec `Stack.Protected`                                                                                                                                                                                                                                                        |
| Cible web                 | produit / outil de dev                                                                                                      | outil de dev (MVP mobile) ; ne pas investir dans le web de prod. Un repo `Web-app` existe dans l'organisation : clarifier son rôle avec l'équipe                                                                                                                                                   |
| Tuiles de carte           | build quotidien Protomaps / extrait régional hébergé / fournisseur tiers (Esri, utilisé pour les modes satellite et relief) | extrait régional `.pmtiles` hébergé sur S3/MinIO (Arthur B., « tuiles offline » du PBS) + stratégie hors ligne ; garder Esri seulement si ses conditions d'utilisation le permettent                                                                                                               |
| Formulaires               | faits main / `react-hook-form` + `zod`                                                                                      | `react-hook-form` + `zod` (schémas partageables avec les DTO)                                                                                                                                                                                                                                      |
| Outil E2E                 | Maestro / Detox / autre                                                                                                     | évaluer sur un dev build (owner : Yohan)                                                                                                                                                                                                                                                           |

## Tickets Linear proposés (phases 0 et 1)

Format LINEAR_GUIDE : titre « verbe + sujet », labels Type + Domaine, priorité au moins Medium.

| Titre                                                       | Labels             | Owner par défaut |
| ----------------------------------------------------------- | ------------------ | ---------------- |
| Corriger le setup pnpm et le typecheck de la CI front       | Chore · Frontend   | Florian          |
| Rendre les checks CI front obligatoires sur develop et main | Chore · Infra      | Florian          |
| Intégrer l'environnement Docker de dev front                | Chore · Infra      | Florian          |
| Intégrer l'écran carte MapLibre                             | Feature · Frontend | Lucas            |
| Masquer le splash screen au démarrage                       | Bug · Frontend     | Lucas            |
| Charger les styles NativeWind dans le layout racine         | Bug · Frontend     | Lucas            |
| Ajouter les assets de l'application                         | Chore · Frontend   | Lucas            |
| Nettoyer la configuration du repo Client                    | Chore · Frontend   | à définir        |
| Produire un premier dev build Android et iOS                | Chore · Frontend   | Maxim            |
| Documenter l'architecture front dans le Quality Plan        | Docs · Frontend    | Lucas            |
| Mettre en place la navigation et les routes protégées       | Feature · Frontend | Lucas            |
| Exposer les tokens du thème à Tailwind                      | Feature · Frontend | Lucas            |
| Créer le client API typé avec mode mock                     | Feature · Frontend | à définir        |
| Gérer la session utilisateur                                | Feature · Frontend | à définir        |
| Choisir et configurer le lanceur de tests front             | Chore · Frontend   | à définir        |
| Configurer les builds EAS                                   | Chore · Infra      | Florian          |
| Mettre en place les tests E2E mobiles                       | Test · Frontend    | Yohan            |

## Risques

| Risque                                                                                     | Mitigation                                                                               |
| ------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------- |
| Backend en construction (endpoints et format de réponse pas encore stabilisés)             | mocks + contrat OpenAPI validé tôt ; revue commune de l'enveloppe et des types           |
| Tracking en arrière-plan (Doze, économiseurs de batterie des constructeurs, kill par l'OS) | spike sur devices réels dès le début de la story 1.1 (critère : 3 constructeurs Android) |
| MapLibre natif sur RN 0.86 / Expo 57                                                       | dev build Android et iOS dès la phase 0 (0.8)                                            |
| Tuiles servies par le build public Protomaps (pas de SLA, pas de CORS, planète entière)    | hébergement d'un extrait régional ; plan offline                                         |
| Capacité front limitée (Lucas + Maxim en partie) face au périmètre                         | s'en tenir aux `Must` ; Epics 5 et 6 bloqués tant que les postes restent ouverts         |
| Web pris pour un livrable                                                                  | le documenter comme outil de dev (proxy local, worker jsDelivr)                          |
