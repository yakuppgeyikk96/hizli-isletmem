FROM node:22-slim AS base
RUN corepack enable && corepack prepare pnpm@9.0.0 --activate
WORKDIR /app

# Install dependencies
FROM base AS deps
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/hizli-isletmem-panel/package.json ./apps/hizli-isletmem-panel/
COPY packages/shared/package.json ./packages/shared/
COPY packages/eslint-config/package.json ./packages/eslint-config/
COPY packages/typescript-config/package.json ./packages/typescript-config/
RUN pnpm install --frozen-lockfile

# Build
FROM base AS build
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/apps/hizli-isletmem-panel/node_modules ./apps/hizli-isletmem-panel/node_modules
COPY apps/hizli-isletmem-panel/ ./apps/hizli-isletmem-panel/
COPY packages/shared/ ./packages/shared/
COPY packages/typescript-config/ ./packages/typescript-config/
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm --filter hizli-isletmem-panel build

# Production
FROM base AS runner
ENV NODE_ENV=production

COPY --from=build /app/apps/hizli-isletmem-panel/.next/standalone ./
COPY --from=build /app/apps/hizli-isletmem-panel/.next/static ./apps/hizli-isletmem-panel/.next/static
COPY --from=build /app/apps/hizli-isletmem-panel/public ./apps/hizli-isletmem-panel/public

WORKDIR /app/apps/hizli-isletmem-panel
EXPOSE 3000

CMD ["node", "server.js"]
