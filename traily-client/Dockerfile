FROM node:22-alpine AS dev

WORKDIR /app

RUN corepack enable && corepack prepare pnpm@10.13.1 --activate

COPY package.json pnpm-lock.yaml ./

RUN pnpm install

COPY . .

# Metro bundler (native + web)
EXPOSE 8081

ENTRYPOINT [ "pnpm", "start" ]
