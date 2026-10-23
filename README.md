# Traily · Client mobile

Application mobile de **Traily**, une app de randonnée gamifiée centrée sur la découverte naturaliste. L'utilisateur enregistre sa trace GPS et photographie les espèces rencontrées pour les faire identifier. Ses découvertes complètent ses collections (herbier, bestiaire) et lui rapportent des points.

Ce repo contient l'app iOS et Android, développée avec Expo (React Native) et TypeScript. Elle ne communique qu'avec l'API du repo [`backend`](https://github.com/Traily-org/backend).

## Stack

- [Expo](https://docs.expo.dev/) SDK 57 et [Expo Router](https://docs.expo.dev/router/introduction/) (routage par fichiers). Expo prend en charge la configuration native et simplifie les tests sur Android et iOS.
- React Native et TypeScript en mode strict
- [NativeWind](https://www.nativewind.dev/) (Tailwind CSS) pour les styles
- ESLint et Prettier
- pnpm

> Expo SDK 57 a modifié plusieurs API. Se référer à la [documentation v57](https://docs.expo.dev/versions/v57.0.0/) plutôt qu'à des exemples plus anciens.

## Prérequis

Deux façons de travailler, au choix :

- **Avec Docker** : [Docker Desktop](https://www.docker.com/products/docker-desktop/) (ou Docker Engine + Compose sous Linux). Ni Node ni pnpm à installer.
- **En local** : Node.js 22 LTS (22.12 ou plus récent) et pnpm (`npm install -g pnpm`). La version exacte de pnpm est fixée par `packageManager` dans `package.json` et choisie automatiquement.

Dans les deux cas, de quoi ouvrir l'app : le _development build_ de Traily sur un téléphone (voir [Development build](#development-build)), un navigateur (version web), un émulateur Android (Android Studio) ou le simulateur iOS (Xcode, macOS uniquement). [Expo Go](https://expo.dev/go) ne suffit plus : la carte utilise MapLibre, un module natif absent d'Expo Go.

Pour le development build : [go-task](https://taskfile.dev) et un compte [Expo](https://expo.dev/signup) (gratuit).

## Installation

```bash
git clone git@github.com:Traily-org/Client.git
cd Client
git switch develop
cd traily-client
```

La branche par défaut est `main`, qui ne reçoit que les releases : toujours travailler depuis `develop`.

Sous Windows, cloner le repo dans un chemin court (ex. `C:\dev\Client`). Au-delà de 260 caractères, certains chemins de `node_modules` font échouer Node.

## Lancer l'application

Toutes les commandes se lancent depuis `traily-client/`.

### Development build

Version d'Expo Go propre à Traily, qui embarque ses modules natifs (MapLibre). Elle se construit dans le cloud EAS et s'installe sur le téléphone ; le code JavaScript lui est ensuite servi par Metro, comme avec Expo Go.

Une fois par poste :

```bash
task eas:init        # connexion au compte Expo + liaison du projet à EAS
task build:android   # build EAS (~15 min), puis installer l'APK via le QR code affiché
```

Au quotidien :

```bash
task start           # lance Metro ; ouvrir Traily sur le téléphone (même réseau que le poste)
```

Le JavaScript se recharge à chaque sauvegarde, sans rebuild. Seul un changement natif (dépendance native, `app.json`, plugin) impose un nouveau build : `task start` le signale, et `task build:android` ne reconstruit que dans ce cas (`--force` pour forcer). L'état des builds est suivi par empreinte native (`@expo/fingerprint`) dans `.expo/dev-builds.json`, propre à chaque poste. `task build:ios` fonctionne de la même façon mais exige un compte Apple Developer.

### Avec Docker

```bash
cp .env.example .env    # renseigner l'IP LAN du poste (voir les commentaires du fichier)
docker compose up --build
```

- Metro tourne dans le conteneur `traily_client_dev`, sur le port 8081 : version web sur http://localhost:8081, QR code Expo Go dans les logs.
- Les sources sont montées dans le conteneur : une modification est prise en compte tout de suite (hot reload), sans rebuild.
- Les dépendances s'ajoutent dans le conteneur : `docker exec traily_client_dev pnpm expo install <paquet>`.
- Après un `git pull` qui modifie `package.json` ou `pnpm-lock.yaml`, lancer `docker exec traily_client_dev pnpm install` : les dépendances vivent dans un volume Docker que `--build` ne met pas à jour. En cas de doute, `docker compose down -v` puis `docker compose up --build` repart de zéro.
- Avec [go-task](https://taskfile.dev) installé, `task docker:dev` remplace `docker compose up --build` (`task --list` pour les autres tâches).

### En local

```bash
pnpm install
pnpm start
```

### Commandes

| Commande                     | Rôle                                                               |
| ---------------------------- | ------------------------------------------------------------------ |
| `pnpm start`                 | démarre le serveur Metro pour le development build                 |
| `pnpm android`               | ouvre l'app sur un émulateur ou un appareil Android                |
| `pnpm ios`                   | ouvre l'app sur le simulateur iOS                                  |
| `pnpm web`                   | version web, réservée au développement                             |
| `pnpm lint`                  | analyse le code avec ESLint                                        |
| `pnpm format`                | formate le code avec Prettier (`pnpm format:check` pour vérifier)  |
| `pnpm typecheck`             | vérifie les types TypeScript (`tsc --noEmit`)                      |
| `pnpm test`                  | lance les tests Vitest (`pnpm test:coverage` pour la couverture)   |
| `pnpm expo install <paquet>` | ajoute une dépendance Expo dans une version compatible avec le SDK |
| `npx expo-doctor@latest`     | diagnostique la configuration et les dépendances                   |

En Docker, préfixer par `docker exec traily_client_dev`, par exemple `docker exec traily_client_dev pnpm lint`.

### Variables d'environnement

Les variables se placent dans `traily-client/.env`, qui n'est pas versionné. Seules celles préfixées par `EXPO_PUBLIC_` sont lisibles par l'app, et elles finissent dans le bundle : n'y mettre aucun secret. Toute nouvelle variable doit être déclarée dans `traily-client/.env.example`.

| Variable                             | Rôle                                                                                                                                                |
| ------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| `EXPO_PUBLIC_MAPTILER_KEY`           | clé [MapTiler](https://cloud.maptiler.com/account/keys/) des fonds de carte, à restreindre à l'app dans le tableau de bord MapTiler                 |
| `EXPO_PUBLIC_MAPTILER_LEGAL_NOTICES` | logo MapTiler + attribution toujours visible sur la carte. Obligatoire avec le plan gratuit : ne mettre `false` qu'avec un plan payant ou un accord |
| `REACT_NATIVE_PACKAGER_HOSTNAME`     | IP LAN du poste, pour atteindre Metro dans Docker depuis un téléphone                                                                               |

Après un changement de `.env`, relancer Metro avec `task start -- --clear` : les valeurs sont figées dans le bundle.

## Structure

```
traily-client/
  app/              routes Expo Router : un fichier = un écran
  src/
    features/       code regroupé par fonctionnalité (composants, hooks, services, types)
    constants/      thème et configuration
    hooks/          hooks partagés
    global.css      point d'entrée Tailwind / NativeWind
  app.json          configuration Expo
  eas.json          profils de build EAS (development build)
  scripts/          outils de dev (suivi des development builds)
  Taskfile.yml      tâches go-task (dev, build EAS, Docker)
  Dockerfile, docker-compose.yml   environnement de dev Docker
```

## Contribuer

Les branches partent de `develop`, et les PR y retournent avec une CI verte et au moins une approbation. Les commits suivent [Conventional Commits](https://www.conventionalcommits.org/fr/) : `feat:`, `fix:`, `chore:`, `docs:`, `test:`.

Le détail des règles (nommage des branches, format des commits, PR, Definition of Done) est dans [CONTRIBUTING.md](CONTRIBUTING.md).

## Documentation

- [CONTRIBUTING.md](CONTRIBUTING.md) : branches, commits, pull requests, Definition of Done
- [CLAUDE.md](CLAUDE.md) : guide de contexte du repo (architecture, conventions de code, état actuel, pièges connus), pour l'équipe et les agents IA
- [doc/](doc/) : vue d'ensemble du projet, analyse du code et roadmap front
- [Traily-org/Docs](https://github.com/Traily-org/Docs) : documents de cadrage (produit, architecture, process, qualité)

## Licence

[MIT](LICENSE)
