# ─── Stage 1: Build ───────────────────────────────────────────────────────
FROM node:20-alpine AS builder
WORKDIR /repo

RUN corepack enable && corepack prepare pnpm@9.4.0 --activate

# Copy workspace manifests + lockfile (lockfile optional on first run)
COPY package.json pnpm-workspace.yaml ./
COPY pnpm-lock.yaml* ./
COPY packages/shared/package.json ./packages/shared/
COPY packages/renderer/package.json ./packages/renderer/
COPY apps/api/package.json ./apps/api/

RUN pnpm install --no-frozen-lockfile

# Copy source
COPY packages/shared ./packages/shared
COPY packages/renderer ./packages/renderer
COPY apps/api ./apps/api

# Build
RUN pnpm --filter @devfolio/shared build
RUN pnpm --filter @devfolio/api build

# ─── Stage 2: Runtime ─────────────────────────────────────────────────────
FROM node:20-alpine AS runner
WORKDIR /app

RUN corepack enable && corepack prepare pnpm@9.4.0 --activate

COPY package.json pnpm-workspace.yaml ./
COPY pnpm-lock.yaml* ./
COPY packages/shared/package.json ./packages/shared/
COPY apps/api/package.json ./apps/api/

RUN pnpm install --no-frozen-lockfile --prod

COPY --from=builder /repo/packages/shared/dist ./packages/shared/dist
COPY --from=builder /repo/apps/api/dist ./apps/api/dist

WORKDIR /app/apps/api

ENV NODE_ENV=production
EXPOSE 3001

CMD ["node", "dist/main"]
