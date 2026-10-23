# Contribuer au client Traily

Ces règles viennent des documents de cadrage du repo [`Docs`](https://github.com/Traily-org/Docs) : DEVELOPMENT_PROCESS, OBS, QUALITY_PLAN_FRONTEND, DEFINITION_OF_DONE et LINEAR_GUIDE. Elles sont regroupées ici pour être appliquées au quotidien. Le repo `Docs` fait foi, sauf pour le flux de branches (`develop` au lieu de `main`) et la clé des tickets (`TRA`), qui suivent ce qui est réellement en place.

## Flux de travail

**1 tâche = 1 ticket Linear = 1 branche = 1 PR.**

1. Prendre un ticket Linear (équipe `TRA`) et le passer en _In Progress_.
2. Créer la branche **depuis `develop`** :
   ```bash
   git switch develop
   git pull
   git switch -c feat/TRA-42-map-screen
   ```
3. Développer en commitant selon la convention ci-dessous.
4. Ouvrir la PR **vers `develop`**. Le ticket passe en _QA_.
5. Merger une fois la CI verte et la PR approuvée. Le ticket passe en _Done_.

`develop` est la branche d'intégration. `main` sert aux releases et ne reçoit que des PR depuis `develop`. Aucun commit direct sur ces deux branches : GitHub impose une PR.

## Branches

Format : `<préfixe>/TRA-<numéro>-<description-courte>`, en anglais et en kebab-case.

| Préfixe   | Usage                                   |
| --------- | --------------------------------------- |
| `feat/`   | nouvelle fonctionnalité                 |
| `fix/`    | correction de bug non critique          |
| `hotfix/` | correction urgente en production        |
| `chore/`  | maintenance, dépendances, configuration |
| `docs/`   | documentation uniquement                |
| `test/`   | ajout ou correction de tests            |

Exemples : `feat/TRA-42-map-screen`, `fix/TRA-57-hide-splash-screen`.

## Commits

La convention [Conventional Commits](https://www.conventionalcommits.org/fr/) est **obligatoire** sur toutes les branches.

```
<type>: <description>
```

| Type    | Usage                                       |
| ------- | ------------------------------------------- |
| `feat`  | nouvelle fonctionnalité                     |
| `fix`   | correction de bug                           |
| `chore` | maintenance, dépendances, configuration, CI |
| `docs`  | documentation                               |
| `test`  | ajout ou correction de tests                |

- La description est en anglais, à l'impératif et en minuscules, comme dans les exemples du DEVELOPMENT_PROCESS : `add`, `fix`, `update`, et non `added` ou `Adds`.
- Un commit = un changement cohérent.
- La spécification autorise une portée facultative entre parenthèses : `feat(map): add satellite mode`.

```
feat: add trail recording screen
fix: hide splash screen once the root layout is ready
chore: pin eslint to v9
docs: document map environment variables
test: cover map style builder
```

À éviter : `update`, `wip`, `fix stuff`, `feat: Added map` (passé, majuscule).

## Pull requests

- **Le titre suit aussi Conventional Commits** (ex. `feat: add map screen`). Les PR sont fusionnées en squash : le commit final sur `develop` reprend le titre de la PR, ou celui du commit s'il n'y en a qu'un.
- Une PR = une fonctionnalité ou un fix. Pas de PR fourre-tout.
- La description donne le lien vers le ticket Linear, ce qui change et comment le tester.
- Tout changement d'UI est accompagné d'une capture d'écran ou d'une courte vidéo.
- Le merge exige une CI verte et l'approbation d'au moins un autre membre.

## Avant d'ouvrir une PR

Depuis `traily-client/`, lancer les vérifications de la CI :

```bash
pnpm typecheck
pnpm lint
pnpm format         # ou `pnpm format:check` pour vérifier sans modifier
pnpm test
```

Avec Docker, préfixer chaque commande par `docker exec traily_client_dev` (voir le [README](README.md#avec-docker)).

## Definition of Done

Une tâche n'est terminée que si :

- [ ] le code correspond aux exigences du ticket Linear ;
- [ ] il respecte les standards du projet et ne laisse aucun TODO critique ;
- [ ] des tests ont été ajoutés si nécessaire, et tous passent ;
- [ ] la CI est verte ;
- [ ] la PR a été relue et approuvée par au moins un autre membre ;
- [ ] la documentation est à jour si nécessaire (`README.md`, `CLAUDE.md`, `doc/`) ;
- [ ] la fonctionnalité a été testée en environnement de développement.
