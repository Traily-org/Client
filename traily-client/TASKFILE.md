# Commands

Useful commands for working on `traily-client`, local (`pnpm`) and Docker.

## Local (pnpm)

| Command | Description |
|---|---|
| `pnpm install` | Install dependencies |
| `pnpm start` | Start the Expo dev server (Metro) |
| `pnpm android` | Start the dev server and open on an Android emulator/device |
| `pnpm ios` | Start the dev server and open on an iOS simulator/device |
| `pnpm web` | Start the dev server and open in the browser |
| `pnpm lint` | Lint with ESLint |
| `pnpm format` | Format the codebase with Prettier |
| `pnpm format:check` | Check formatting without writing changes |
| `pnpm reset-project` | Move the starter code aside and reset to a blank `app/` |

## Docker (dev)

Runs the same `pnpm start` dev server inside a container — no local Node/pnpm needed.

```bash
cp .env.example .env   # first time only, then fill in your LAN IP
```

| Command | Description |
|---|---|
| `docker compose up --build` | Build the image if needed and start the dev server |
| `docker compose up -d --build` | Same, but detached (background) |
| `docker compose down` | Stop and remove the container |
| `docker compose exec app pnpm <cmd>` | Run any pnpm command inside the running container (e.g. `pnpm add <package>`, `pnpm lint`) |
| `docker compose logs -f app` | Follow the dev server logs |
