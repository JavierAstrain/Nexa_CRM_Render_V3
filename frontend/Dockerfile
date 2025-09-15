FROM node:20-alpine AS base
WORKDIR /app
RUN corepack enable && corepack prepare pnpm@9.12.0 --activate
COPY package.json pnpm-lock.yaml ./
RUN pnpm i --frozen-lockfile
COPY index.html vite.config.ts postcss.config.js tailwind.config.ts tsconfig.json ./
COPY src ./src
RUN pnpm build

EXPOSE 5173
CMD ["pnpm","dev","--host","0.0.0.0"]
