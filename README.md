# Client

Partie client de Traily, développée avec **React Native** (Expo), **TypeScript** et **pnpm**.

## Stack

- React Native
- TypeScript
- Expo
- pnpm

## Installation

Prérequis : Node 24, pnpm et [Task](https://taskfile.dev).

```bash
cd traily-client
task setup
```

## Lancer le projet

L'app utilise MapLibre (code natif) : elle ne tourne pas dans Expo Go, mais dans un **development build**, une version d'Expo Go propre à Traily, installée sur ton téléphone.

Une seule fois :

```bash
task eas:init        # connexion au compte Expo + liaison du projet à EAS
task build:android   # build dans le cloud EAS, puis installe l'APK via le QR code affiché
```

Au quotidien :

```bash
task dev             # lance Metro ; ouvre Traily sur le téléphone (même Wi-Fi que le PC)
```

Le code JavaScript se recharge à chaque sauvegarde, sans rebuild. `task dev` prévient quand le code natif a changé (nouvelle dépendance native, `app.json`…) ; il suffit alors de relancer `task build:android`, qui ne reconstruit que dans ce cas (`--force` pour forcer).

## Pourquoi Expo ?

Expo simplifie le développement React Native en facilitant la configuration, le lancement et le test de l'application sur Android et iOS. Il permet de se concentrer sur le développement du client sans gérer immédiatement toute la configuration native.

## Commandes

```bash
task                 # Lister les tâches
task setup           # Installer les dépendances
task eas:init        # Lier le projet à EAS (une seule fois)
task build:android   # Development build Android (seulement si le natif a changé)
task build:ios       # Development build iOS (compte Apple Developer requis)
task dev             # Lancer Metro (`task dev -- --clear` pour vider le cache)
```
