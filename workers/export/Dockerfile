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
FROM node:20-slim AS runner
WORKDIR /app

# Playwright/Chromium system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    libnss3 libnspr4 libatk1.0-0 libatk-bridge2.0-0 \
    libcups2 libdrm2 libxkbcommon0 libxcomposite1 libxdamage1 \
    libxfixes3 libxrandr2 libgbm1 libasound2 libpango-1.0-0 \
    libpangocairo-1.0-0 libgtk-3-0 libx11-xcb1 \
    && rm -rf /var/lib/apt/lists/*

RUN corepack enable && corepack prepare pnpm@9.4.0 --activate

COPY package.json pnpm-workspace.yaml ./
COPY pnpm-lock.yaml* ./
COPY packages/shared/package.json ./packages/shared/
COPY packages/renderer/package.json ./packages/renderer/
COPY workers/export/package.json ./workers/export/

RUN pnpm install --no-frozen-lockfile --prod

# Install Playwright Chromium browser
RUN npx playwright install chromium

COPY --from=builder /repo/packages/shared/dist ./packages/shared/dist
COPY --from=builder /repo/packages/renderer/dist ./packages/renderer/dist
COPY --from=builder /repo/workers/export/dist ./workers/export/dist

RUN mkdir -p /app/uploads

WORKDIR /app/workers/export
ENV NODE_ENV=production
ENV PLAYWRIGHT_BROWSERS_PATH=/root/.cache/ms-playwright

CMD ["node", "dist/worker.js"]
