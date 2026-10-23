# Traily : vue d'ensemble du projet

> Synthèse des documents de cadrage du repo [`Traily-org/Docs`](https://github.com/Traily-org/Docs), lue sous l'angle du développement front : ARCHITECTURE, WBS, PBS, OBS, BACKLOG, QUALITY_PLAN_FRONTEND et QUALITY_PLAN_BACKEND, DEVELOPMENT_PROCESS, DEFINITION_OF_DONE, LINEAR_GUIDE, HARDWARE_REQUIREMENTS.
> Rédigée le 21/09/2026, mise à jour le 09/10/2026. En cas de divergence, les documents du repo Docs font foi. Les écarts relevés sont listés en §9.
> Ce document décrit le fonctionnement et les règles stables du projet. L'état d'avancement des autres repos (endpoints disponibles, branches, schéma réel) se consulte directement dans ces repos.

## 1. Le produit

**Traily** est une application mobile de randonnée gamifiée, centrée sur la découverte naturaliste et la compétition communautaire.

Parcours type :

1. l'utilisateur choisit une randonnée (ou propose la sienne) et suit sa trace GPS en temps réel ;
2. l'app affiche les espèces (plantes, animaux, insectes) observables sur le parcours, selon la localisation, la saison et les données communautaires ;
3. il photographie les espèces rencontrées : la photo est géolocalisée, épinglée sur la trace et soumise à l'identification IA ;
4. chaque contribution validée (par l'IA, puis par un modérateur si nécessaire) rapporte des points et alimente ses collections : **herbier** (flore) et **bestiaire** (faune, insectes) ;
5. des classements par trace, région et équipe, des clans et un fil communautaire entretiennent la compétition. Un cadre éthique (zones protégées, alertes de distance, conseils par espèce) encadre la pratique.

**Utilisateur cible** : randonneur occasionnel ou régulier, curieux de nature, qui veut plus qu'un simple tracker GPS (dimension sociale et progression).

## 2. Périmètre fonctionnel (Epics du backlog)

| #   | Epic                                                                                             | Priorité                      | Impact côté front                                                                                                      | Owner UI (OBS)            |
| --- | ------------------------------------------------------------------------------------------------ | ----------------------------- | ---------------------------------------------------------------------------------------------------------------------- | ------------------------- |
| 1   | Socle randonnée : GPS temps réel (foreground/background), traces, difficulté, photo géolocalisée | Must                          | carte, tracking, écrans de trace (détail, profil altimétrique, recherche et filtres), caméra, file d'upload hors ligne | Lucas (UI), Maxim (natif) |
| 2   | Système d'espèces : référentiel, listes observables, identification photo, validation            | Must → Should                 | liste d'espèces par trace, résultat d'identification avec fallback manuel, statut des contributions                    | Lucas                     |
| 3   | Collections personnelles : herbier, bestiaire, fiche espèce, profil                              | Must                          | grilles « Pokédex » (découvert / verrouillé), filtres et tri, fiche espèce, profil et historique                       | Lucas                     |
| 4   | Gamification : points, badges, leaderboards                                                      | Should                        | solde et historique de points, badges, podiums paginés                                                                 | Lucas                     |
| 5   | Communauté & équipes : clans, classement d'équipe, fil                                           | Should (bloqué, poste ouvert) | écrans équipe, invitations, fil par trace                                                                              | Recrue 1                  |
| 6   | Modération : dashboard, signalement, historique                                                  | Should (bloqué, poste ouvert) | bouton de signalement, dashboard modérateur                                                                            | Recrue 2                  |
| 7   | Cadre éthique : zones protégées, alertes, pédagogie                                              | Could                         | couche carte, alertes non intrusives, onboarding éthique                                                               | Lucas                     |
| 8   | Backend & IA : API cœur, micro-services                                                          | Must → Should                 | consommation des API uniquement                                                                                        | —                         |
| 9   | Infrastructure : stockage, CI/CD, monitoring, environnements                                     | Must                          | CI front, builds EAS                                                                                                   | Florian, Arthur B.        |
| 10  | Gestion de projet & qualité : pilotage, tests, déploiement stores                                | Must                          | tests unitaires et E2E, fiches stores                                                                                  | Yohan (E2E), Florian      |
| 11  | Bonus hors MVP : points d'intérêt « pokestop », avatar et compagnon, SmartWatch                  | Bonus                         | —                                                                                                                      | à arbitrer                |

Critères d'acceptation chiffrés qui contraignent directement le front (BACKLOG) :

- **GPS** : position affichée en moins de 3 s ; distance à ±5 % ; moins de 5 % de points perdus en arrière-plan sur une session de 3 h (testé sur au moins 3 constructeurs Android) ; aucun crash sur 2 h et plus, iOS et Android.
- **Traces** : trace visible dans l'historique moins de 5 s après la fin de session, sans perte en cas de coupure réseau ; écran détail en moins de 2 s ; recherche géospatiale en moins de 2 s, filtres en moins de 1 s.
- **Photos** : 100 % des photos in-app avec métadonnées GPS valides ; photos prises hors ligne envoyées au retour du réseau sans perte (test sur 50 prises) ; pin à ±20 m ; plus de 98 % d'uploads réussis en réseau instable.
- **Collections et scores** : fiche espèce en moins de 2 s ; classement en moins de 2 s ; filtres fonctionnels sur une collection de 100 espèces et plus.

## 3. Architecture système

```
Application mobile : Expo / React Native, TypeScript        ← repo Client
          │  HTTPS / REST  /api/v1   (Authorization: Bearer <jwt>)
          ▼
API Go : cœur métier, auth, données                          ← repo backend
          │ HTTP interne                         │
          ▼                                      ▼
Micro-services IA                    ← repo IA   PostgreSQL + PostGIS
  trail-analyzer (Go), gps-processor (Go),
  recommender / identification (Python + FastAPI)

Stockage objet S3 / MinIO : photos, tuiles offline (upload direct depuis le mobile via URL présignée)
```

Règles structurantes pour le client :

| Sujet              | Règle                                                                                                                                                                                                         |
| ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Accès aux services | le mobile n'appelle que l'API Go ; les services IA sont appelés par le backend. Les données IA sont toujours optionnelles (mode dégradé si un service tombe).                                                 |
| Authentification   | login → access token (15 min) + refresh token (30 j), stockés dans `expo-secure-store`, jamais dans AsyncStorage. À expiration : `POST /auth/refresh`. Les refresh tokens sont révocables côté serveur.       |
| Photos             | `POST /trails/:id/photos/upload-url` → `{ presigned_url, photo_id }` → `PUT` du binaire vers S3/MinIO → `PATCH /photos/:id/confirm`. Compression avant envoi : qualité 0.7, 1920 px max.                      |
| Hors connexion     | SQLite local (trails consultés, waypoints, photos en attente) et file d'actions persistante. Synchronisation automatique à la reconnexion, avec gestion des conflits. Même UI, avec une bannière « offline ». |
| Carte              | MapLibre ; traces consultées mises en cache SQLite pour l'accès hors ligne.                                                                                                                                   |
| État global        | Zustand (ADR : simple, léger, sans boilerplate).                                                                                                                                                              |
| Configuration      | `EXPO_PUBLIC_API_URL` (via `app.config.ts` + `.env` selon ARCHITECTURE.md).                                                                                                                                   |

Modules Expo prévus : `expo-location` (+ task manager pour l'arrière-plan), `expo-camera`, `expo-image-picker`, `expo-sqlite`, `expo-secure-store`, `expo-network`.

## 4. Contrat d'API

Conventions (ARCHITECTURE.md, QUALITY_PLAN_BACKEND.md) :

- préfixe `/api/v1/`, routes en kebab-case au pluriel (`/trail-sessions`) ;
- succès : `{ "data": { ... } }` ; erreur : `{ "error": { "code": "VALIDATION_ERROR", "message": "..." } }` ;
- codes HTTP 200, 201, 204, 400, 401, 403, 404, 409, 500 ;
- dates ISO 8601 UTC (`"2025-01-15T10:30:00Z"`), IDs UUID v4 sous forme de chaîne.

Ressources prévues par ARCHITECTURE.md : auth (`register`, `login`, `refresh`), utilisateurs (`/users/me`), trails (dont la recherche géographique `GET /trails?near=<lat,lng>&radius=<km>`), waypoints, photos (URL présignée puis confirmation) et sessions d'enregistrement (`/trail-sessions`). Ces endpoints sont indicatifs : la référence sera la documentation OpenAPI du backend (Story 8.1), à utiliser pour générer les types TypeScript. Avant de brancher un écran, vérifier dans le repo `backend` ce qui existe réellement et sous quel format ; en attendant, travailler sur des mocks.

Entités principales (utiles pour les types front) : `users`, `trails` (tracé en LineString), `waypoints` (Point), `trail_sessions` (tracé enregistré), `photos` (Point, clé de stockage S3). Géométries en WGS84 (SRID 4326). Attention à l'ordre des coordonnées : GeoJSON et MapLibre utilisent `[lng, lat]`, alors que le paramètre prévu `near=<lat,lng>` met la latitude en premier. Centraliser la conversion.

Flux métier côté mobile :

- **Enregistrement d'une randonnée** : démarrage de session → GPS en arrière-plan → points enregistrés périodiquement en SQLite → photos stockées localement (file d'upload) → en fin de session, `POST /trail-sessions` avec le LineString complet et upload des photos en parallèle. Hors connexion, la synchronisation est différée.
- **Consultation d'un trail** : `GET /trails?near=…&radius=…` → affichage MapLibre → mise en cache SQLite.
- **Identification** : photo → backend → service IA → espèce(s) probable(s) avec score de confiance. Sous le seuil, choix manuel parmi des candidats.

## 5. Organisation multi-repo

| Repo                                                                       | Rôle                                        | Fonctionnement                                                                                                                                                             |
| -------------------------------------------------------------------------- | ------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [`Client`](https://github.com/Traily-org/Client)                           | app mobile Expo / React Native              | seul client de la plateforme ; ne parle qu'au backend                                                                                                                      |
| [`backend`](https://github.com/Traily-org/backend) (anciennement `Server`) | API REST Go : auth, données, logique métier | Gin, architecture hexagonale (`domain/` métier, `adapters/` HTTP, `infrastructure/` base et stockage), PostgreSQL + PostGIS ; stack locale via Docker Compose et Taskfile  |
| [`IA`](https://github.com/Traily-org/IA)                                   | micro-services IA                           | Go et Python/FastAPI (identification d'espèces, analyse de traces, recommandations), appelés uniquement par le backend ; leurs données restent optionnelles pour le client |
| [`Docs`](https://github.com/Traily-org/Docs)                               | documents de cadrage                        | produit, architecture, organisation, process et qualité ; font foi en cas de divergence                                                                                    |

Les repos de code suivent le même flux : `develop` sert à l'intégration et `main` ne reçoit que des PR depuis `develop`.

## 6. Équipe et responsabilités (OBS)

| Membre                  | Rôle                                | Lien avec le front                                                                        |
| ----------------------- | ----------------------------------- | ----------------------------------------------------------------------------------------- |
| Florian                 | coordinateur, CI/CD, environnements | CI et environnements de dev du front ; arbitre les décisions transverses                  |
| Lucas                   | UI/UX et architecture front         | owner des écrans et de l'architecture front                                               |
| Maxim                   | mobile natif et backend             | GPS foreground/background, caméra et EXIF, offline (SQLite, file de synchro) ; renfort UI |
| Yohan                   | backend et tests E2E                | API utilisateurs et scores ; stratégie et CI des tests end-to-end                         |
| Arthur J.               | IA espèces et modération            | API FastAPI `/identify`, `/verify`, `/recommend`, consommées via le backend               |
| Arthur B.               | infrastructure et architecture      | Docker, PostGIS, S3/MinIO (photos, tuiles offline), observabilité                         |
| Recrue 1 (poste ouvert) | fullstack communauté                | écrans équipes, fil, notifications push                                                   |
| Recrue 2 (poste ouvert) | fullstack modération                | dashboard de modération, signalement                                                      |

Ownership par module : l'UI revient à Lucas partout, sauf communauté (Recrue 1) et modération (Recrue 2). Côté backend, GPS, traces et espèces observables reviennent à Maxim ; identification, collections et scores à Maxim et Yohan ; le profil à Yohan ; les zones sensibles à Arthur B.

## 7. Processus

- **Méthode** : Scrum adapté, sprint de 2 mois (planning en semaine 1, développement en semaines 2 à 7, review et rétrospective en semaine 8), pas de daily. Syncs à la demande.
- **Linear** : workspace `traily`, équipe `TRA`. Deux labels par ticket : un type (`Feature`, `Bug`, `Chore`, `Docs`, `Test`) et un domaine (`Frontend`, `Backend`, `IA`, `Infra`, `DB`). Priorité jamais « No priority ». Titre « verbe + sujet ». Workflow Backlog → Todo → In Progress → QA (PR ouverte) → Done (PR mergée).
- **Git** : 1 tâche = 1 ticket = 1 branche = 1 PR ; préfixes `feat/`, `fix/`, `hotfix/`, `chore/`, `docs/`, `test/` ; Conventional Commits ; au moins une approbation ; pas de commit direct sur `main` ; capture ou vidéo pour les PR UI.
- **CI front** (Quality Plan) : `tsc --noEmit`, ESLint (config Expo), Prettier, tests (`jest --ci` dans le plan), avertissement si couverture < 60 %, `eas build --profile preview` sur `main`.
- **Tests** : couverture cible 60 à 70 % ; mappers DTO ↔ domaine et utilitaires à 100 % ; API et modules natifs mockés ; pas de snapshots ; `describe` par unité testée, `it` en langage naturel.
- **Environnements** : `development` (local, `.env`), `staging` (déployé au merge), `production` (promotion manuelle depuis staging).
- **Definition of Done** : exigences du ticket, standards respectés, pas de TODO critique, tests ajoutés et verts, CI verte, revue approuvée, doc à jour, fonctionnalité testée en dev.

## 8. Contraintes matérielles

- Appareils cibles : iOS 16+, Android 8.0+ (API 26). À recouper avec les minimums d'Expo SDK 57.
- GPS obligatoire ; caméra optionnelle (fonctionnalité dégradée sans) ; environ 500 Mo libres recommandés pour le cache ; aucun capteur spécial (altitude issue du GPS).
- Poste de dev : Docker (stack locale complète), 8 Go de RAM, Expo Go ou simulateur. Position GPS simulée via Xcode ou Android Studio.

## 9. Écarts et incohérences relevés dans la documentation

| #   | Sujet               | Documentation                                                                                        | Réalité / autre document                                                                                 | Impact front                                                           |
| --- | ------------------- | ---------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------- |
| 1   | Flux Git            | DEVELOPMENT_PROCESS : branches depuis `main`, merge sur `main` = déploiement                         | repos de code : intégration sur `develop`, PR vers `main` uniquement depuis `develop`, squash uniquement | brancher depuis `develop` ; mettre à jour DEVELOPMENT_PROCESS          |
| 2   | Lanceur de tests    | QUALITY_PLAN_FRONTEND : Jest                                                                         | `chore/frontend-ci` : Vitest (« jest is not used here »)                                                 | décision à acter (voir roadmap)                                        |
| 3   | Structure `src/`    | QUALITY_PLAN_FRONTEND : par couches (`components/`, `services/*Service.ts`, `store/`, `lib/api.ts`…) | code : par feature (`src/features/<feature>/`)                                                           | mettre à jour le Quality Plan                                          |
| 4   | Groupes de routes   | QUALITY_PLAN_FRONTEND : `app/(auth)/` = routes authentifiées, `app/(public)/` = login/register       | code : `app/auth/` contient login/register (URL `/auth/login`)                                           | risque de confusion sur « auth » ; voir roadmap                        |
| 5   | Rythme              | DEVELOPMENT_PROCESS : sprint de 2 mois                                                               | LINEAR_GUIDE : cycles de 4 semaines ; cycles et milestones listés (mai à juin 2026) déjà passés          | planning courant à confirmer dans Linear                               |
| 6   | Clé des tickets     | LINEAR_GUIDE : équipe `TRA`                                                                          | DEVELOPMENT_PROCESS : exemple `feat/TRAIL-42-…`                                                          | utiliser la clé réelle de Linear                                       |
| 7   | Format des réponses | ARCHITECTURE : enveloppe `{ "data": ... }` / `{ "error": { "code", "message" } }`                    | à vérifier sur les endpoints réels du backend (premiers endpoints sans enveloppe)                        | valider l'enveloppe avec l'équipe backend avant d'écrire le client API |
