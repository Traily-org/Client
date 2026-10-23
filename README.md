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

- Node.js 22 LTS (22.12 ou plus récent)
- pnpm : `npm install -g pnpm`
- De quoi lancer l'app : [Expo Go](https://expo.dev/go) sur un téléphone, un émulateur Android (Android Studio) ou le simulateur iOS (Xcode, macOS uniquement)

## Installation

```bash
git clone git@github.com:Traily-org/Client.git
cd Client
git switch develop
cd traily-client
pnpm install
```

Sous Windows, cloner le repo dans un chemin court (ex. `C:\dev\Client`). Au-delà de 260 caractères, certains chemins de `node_modules` font échouer Node.

## Lancer l'application

Toutes les commandes se lancent depuis `traily-client/`.

| Commande                     | Rôle                                                               |
| ---------------------------- | ------------------------------------------------------------------ |
| `pnpm start`                 | démarre le serveur Metro ; scanner le QR code avec Expo Go         |
| `pnpm android`               | ouvre l'app sur un émulateur ou un appareil Android                |
| `pnpm ios`                   | ouvre l'app sur le simulateur iOS                                  |
| `pnpm web`                   | version web, réservée au développement                             |
| `pnpm lint`                  | analyse le code avec ESLint                                        |
| `pnpm format`                | formate le code avec Prettier (`pnpm format:check` pour vérifier)  |
| `pnpm expo install <paquet>` | ajoute une dépendance Expo dans une version compatible avec le SDK |
| `npx expo-doctor@latest`     | diagnostique la configuration et les dépendances                   |

Expo Go suffit tant que l'app n'utilise que des modules natifs inclus dans Expo Go. Dès qu'elle en utilise un autre (MapLibre pour la carte, par exemple), il faut un _development build_ : `pnpm expo run:android` ou `pnpm expo run:ios`.

### Variables d'environnement

Les variables se placent dans `traily-client/.env`, qui n'est pas versionné. Seules celles préfixées par `EXPO_PUBLIC_` sont lisibles par l'app, et elles finissent dans le bundle : n'y mettre aucun secret. Toute nouvelle variable doit être déclarée dans `traily-client/.env.example`.

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
