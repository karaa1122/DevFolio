# ─── Stage 1: Build ───────────────────────────────────────────────────────
FROM node:20-alpine AS builder
WORKDIR /repo

RUN corepack enable && corepack prepare pnpm@9.4.0 --activate

COPY package.json pnpm-workspace.yaml ./
COPY pnpm-lock.yaml* ./
COPY packages/shared/package.json ./packages/shared/
COPY packages/renderer/package.json ./packages/renderer/
COPY workers/export/package.json ./workers/export/

RUN pnpm install --no-frozen-lockfile

COPY packages/shared ./packages/shared
COPY packages/renderer ./packages/renderer
COPY workers/export ./workers/export


RUN pnpm --filter @devfolio/shared build
RUN pnpm --filter @devfolio/renderer build
RUN pnpm --filter @devfolio/export-worker build

# ─── Stage 2: Runtime ─────────────────────────────────────────────────────
# Playwright's official image ships Chromium, fonts, and required runtime
# libs (libnss, libatk, etc.) baked in — avoiding the long tail of "missing
# .so" issues you hit on bare Alpine.
# NOTE: this tag MUST match the playwright version in workers/export/package.json.
# The bundled Chromium revision is keyed to the package version, so bump both together.
FROM mcr.microsoft.com/playwright:v1.60.0-jammy AS runner
WORKDIR /app

ENV PNPM_HOME=/root/.local/share/pnpm
ENV PATH="$PNPM_HOME:$PATH"

RUN corepack enable && corepack prepare pnpm@9.4.0 --activate

COPY package.json pnpm-workspace.yaml ./
COPY pnpm-lock.yaml* ./
COPY packages/shared/package.json ./packages/shared/
COPY packages/renderer/package.json ./packages/renderer/
COPY workers/export/package.json ./workers/export/

RUN pnpm install --no-frozen-lockfile --prod

COPY --from=builder /repo/packages/shared/dist ./packages/shared/dist
COPY --from=builder /repo/packages/renderer/dist ./packages/renderer/dist
COPY --from=builder /repo/workers/export/dist ./workers/export/dist

RUN mkdir -p /app/uploads

WORKDIR /app/workers/export
ENV NODE_ENV=production

CMD ["node", "dist/worker.js"]
