# ─── Stage 1: Build ───────────────────────────────────────────────────────
FROM node:20-alpine AS builder
WORKDIR /repo

RUN corepack enable && corepack prepare pnpm@9.4.0 --activate

COPY package.json pnpm-workspace.yaml ./
COPY pnpm-lock.yaml* ./
COPY packages/shared/package.json ./packages/shared/
COPY packages/renderer/package.json ./packages/renderer/
COPY apps/web/package.json ./apps/web/

RUN pnpm install --no-frozen-lockfile

COPY packages/shared ./packages/shared
COPY packages/renderer ./packages/renderer
COPY apps/web ./apps/web

RUN pnpm --filter @devfolio/shared build
RUN pnpm --filter @devfolio/renderer build

ARG NEXT_PUBLIC_API_URL=http://localhost:3001
ARG NEXT_PUBLIC_APP_URL=http://localhost:3000
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_APP_URL=$NEXT_PUBLIC_APP_URL

RUN pnpm --filter @devfolio/web build

# ─── Stage 2: Runtime ─────────────────────────────────────────────────────
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

COPY --from=builder /repo/apps/web/.next/standalone ./
COPY --from=builder /repo/apps/web/.next/static ./apps/web/.next/static
COPY --from=builder /repo/apps/web/public ./apps/web/public

USER nextjs
EXPOSE 3000
ENV PORT=3000

CMD ["node", "apps/web/server.js"]
