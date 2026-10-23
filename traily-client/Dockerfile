FROM node:22-alpine AS dev

WORKDIR /app

RUN corepack enable && corepack prepare pnpm@10.13.1 --activate

# node_modules lives on a volume at runtime: pin the store so `pnpm add`
# inside the container reuses it instead of failing on a store mismatch.
ENV npm_config_store_dir=/root/.local/share/pnpm/store

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./

RUN pnpm install

COPY . .

# Metro bundler (native + web)
EXPOSE 8081

ENTRYPOINT [ "pnpm", "start" ]
