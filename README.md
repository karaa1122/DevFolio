<div align="center">

# DevFolio

**A full-stack developer portfolio builder. Build it once, share it forever, and finally stop telling people to "just check your LinkedIn."**

[![CI](https://github.com/your-org/devfolio/actions/workflows/ci.yml/badge.svg)](https://github.com/your-org/devfolio/actions/workflows/ci.yml)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?logo=typescript&logoColor=white)
![Next.js](https://img.shields.io/badge/Next.js-14-black?logo=next.js)
![NestJS](https://img.shields.io/badge/NestJS-10-E0234E?logo=nestjs)
![License](https://img.shields.io/badge/license-MIT-green)

[Live Demo](#) · [API Docs](http://localhost:3001/api/docs) · [Report Bug](https://github.com/your-org/devfolio/issues)

</div>

---

## What Is This?

DevFolio is a **visual portfolio editor** for developers. You log in, drag sections around, pick a theme, write your bio, and publish. Your portfolio gets a public URL. Done.

No Webflow subscription. No WordPress plugin hell. No "I'll update my portfolio this weekend" for the 47th weekend in a row.

**Key ideas:**
- Your entire portfolio is one **JSON object** in the database — no HTML stored, ever
- The editor is a live preview — what you see is literally what gets rendered publicly
- Export to a static **ZIP file** (HTML + CSS) and host it anywhere for free
- Connect GitHub to auto-import your repos as portfolio projects

---

## Architecture

```
devfolio/
├── apps/
│   ├── api/              NestJS REST API            → :3001
│   └── web/              Next.js 14 frontend        → :3000
├── packages/
│   ├── shared/           Zod schemas + TS types
│   └── renderer/         React portfolio renderer
├── workers/
│   └── export/           BullMQ static export worker
├── docker-compose.yml    Full stack (prod-like)
└── .env.example          Start here
```

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Browser   │────▶│  Next.js 14 │────▶│  NestJS API │
│             │     │   :3000     │     │    :3001    │
└─────────────┘     └─────────────┘     └──────┬──────┘
                                               │
                          ┌────────────────────┼────────────┐
                          │                    │            │
                   ┌──────▼──────┐    ┌────────▼───┐  ┌────▼────┐
                   │ PostgreSQL  │    │   Redis    │  │ BullMQ  │
                   │  (JSONB)   │    │  (cache)   │  │ (queue) │
                   └─────────────┘    └────────────┘  └────┬────┘
                                                           │
                                                  ┌────────▼────────┐
                                                  │  Export Worker  │
                                                  │  JSON → ZIP     │
                                                  └─────────────────┘
```

---

## Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | Next.js 14 (App Router), React 18, Tailwind CSS |
| **Editor state** | Zustand + zundo (50-step undo/redo) + @dnd-kit drag & drop |
| **Backend** | NestJS 10, TypeORM, PostgreSQL (JSONB), class-validator |
| **Auth** | JWT access + refresh tokens, bcrypt, GitHub OAuth via Passport.js |
| **Cache** | Redis + cache-manager (portfolio pages cached 5 min) |
| **Queue** | BullMQ — export jobs, retry logic, concurrency control |
| **Export** | JSZip — generates self-contained HTML+CSS ZIP on-demand |
| **Monorepo** | pnpm workspaces + Turborepo |
| **Containers** | Docker + Docker Compose |
| **CI** | GitHub Actions — type-check + tests on every push |

---

## Features

### Editor
- **Drag & drop sections** — reorder your Hero, About, Projects, Skills, Experience, Education, Contact sections
- **Live preview** — toggle between Edit and Preview mode; same renderer as the public page
- **Undo / Redo** — 50 steps, powered by zundo temporal middleware
- **Auto-save** — saves 2 seconds after your last keystroke, like a good editor should
- **Theme panel** — 6 presets, per-color overrides, 5 fonts, border radius, spacing

### Portfolio Sections

| Section | What goes in it |
|---|---|
| **Hero** | Name, title, subtitle, bio, location, "available for work" badge |
| **About** | Long-form bio, highlights list |
| **Projects** | Grid / list / masonry layout, tags, live URL, repo URL, featured flag |
| **Skills** | Tags / bars / grid layout, proficiency levels, categories |
| **Experience** | Timeline or cards, company, role, dates, description |
| **Education** | Institution, degree, field, GPA |
| **Contact** | Email, location, GitHub / LinkedIn / Twitter socials |

### Publishing & Export
- **One-click publish** — your portfolio becomes live at `yourdomain.com/your-slug`
- **Export to ZIP** — self-contained `index.html` + `styles.css`, host on Netlify, GitHub Pages, or a USB stick
- **GitHub integration** — connect once, import repos as portfolio projects with stars, language, and description

### Analytics
- Page view tracking on every public portfolio visit
- Dashboard shows total views, unique visitors, views-per-day sparkline

---

## Prerequisites

Before you start, make sure you have:

- **Node.js** ≥ 20 — [nodejs.org](https://nodejs.org)
- **pnpm** ≥ 9 — `npm install -g pnpm`
- **Docker Desktop** — [docker.com](https://www.docker.com/products/docker-desktop) (for PostgreSQL + Redis)

That's it. No weird system dependencies. No global NestJS CLI required.

---

## Quick Start (Local Development)

### Step 1 — Clone and install

```bash
git clone https://github.com/your-org/devfolio.git
cd devfolio
pnpm install
```

This installs all dependencies for every package in the monorepo. Go make a coffee — pnpm is fast but it's still installing the internet.

### Step 2 — Set up environment variables

```bash
cp .env.example .env
```

Open `.env` and fill in at minimum:

```env
# Generate these — do not use the placeholder values in production
JWT_SECRET=<run: node -e "console.log(require('crypto').randomBytes(64).toString('hex'))">
JWT_REFRESH_SECRET=<run the same command again, get a different value>

# Everything else can stay as-is for local development
```

The rest of the defaults (database URL, Redis, ports) work out of the box with Docker.

> **GitHub OAuth is optional** — the app works fine without it. You only need it if you want the "Connect GitHub" feature. See [GitHub OAuth setup](#github-oauth-setup) below.

### Step 3 — Start the database and Redis

```bash
docker compose up postgres redis -d
```

This starts PostgreSQL on port `5432` and Redis on port `6379`. The API will create all tables automatically on first run (TypeORM `synchronize: true` in development — yes, we know, migrations exist for production).

### Step 4 — Run everything

```bash
pnpm dev
```

Turborepo starts all services in parallel:

| Service | URL | What it is |
|---|---|---|
| **Web App** | http://localhost:3000 | The frontend — start here |
| **API** | http://localhost:3001/api/v1 | REST API |
| **Swagger** | http://localhost:3001/api/docs | Interactive API docs |
| **Export Worker** | (background) | Processes export jobs from BullMQ |

### Step 5 — Create your account

1. Go to http://localhost:3000
2. Click **Register** — fill in name, email, password
3. You're in. Create a portfolio, pick a slug, start building.

---

## Full Docker Setup (Production-like)

If you want everything in containers — API, web, worker, database, Redis — all at once:

```bash
cp .env.example .env
# Edit .env — set proper JWT secrets and your domain URLs

docker compose up --build -d
```

All 5 services start with proper health checks and restart policies. The web app will be at http://localhost:3000.

To check logs:

```bash
docker compose logs -f api        # API logs
docker compose logs -f web        # Next.js logs
docker compose logs -f export-worker  # Export worker logs
```

To stop everything:

```bash
docker compose down
```

To nuke everything including the database volumes (careful):

```bash
docker compose down -v
```

---

## Environment Variables Reference

| Variable | Required | Default | Description |
|---|---|---|---|
| `DATABASE_URL` | Yes | `postgresql://devfolio:devfolio@localhost:5432/devfolio` | PostgreSQL connection string |
| `REDIS_HOST` | Yes | `localhost` | Redis hostname |
| `REDIS_PORT` | Yes | `6379` | Redis port |
| `JWT_SECRET` | Yes | — | Access token signing secret (min 32 chars, use 64) |
| `JWT_EXPIRES_IN` | No | `7d` | Access token lifetime |
| `JWT_REFRESH_SECRET` | Yes | — | Refresh token secret — must be different from JWT_SECRET |
| `JWT_REFRESH_EXPIRES_IN` | No | `30d` | Refresh token lifetime |
| `GITHUB_CLIENT_ID` | No | — | GitHub OAuth App client ID |
| `GITHUB_CLIENT_SECRET` | No | — | GitHub OAuth App client secret |
| `GITHUB_CALLBACK_URL` | No | `http://localhost:3001/api/v1/auth/github/callback` | Must match your OAuth App settings |
| `NEXT_PUBLIC_API_URL` | Yes (web) | `http://localhost:3001` | API URL as seen by the browser |
| `PORT` | No | `3001` | API port |

---

## GitHub OAuth Setup

GitHub OAuth is optional but enables the "Connect GitHub → import repos" feature.

1. Go to [github.com/settings/developers](https://github.com/settings/developers)
2. Click **New OAuth App**
3. Fill in:
   - **Application name**: DevFolio (or whatever)
   - **Homepage URL**: `http://localhost:3000`
   - **Authorization callback URL**: `http://localhost:3001/api/v1/auth/github/callback`
4. Copy the **Client ID** and generate a **Client Secret**
5. Add them to your `.env`:
   ```env
   GITHUB_CLIENT_ID=your_client_id
   GITHUB_CLIENT_SECRET=your_client_secret
   ```
6. Restart the API — that's it

For production, replace `localhost` URLs with your actual domain.

---

## How to Use the Editor

Once you've created a portfolio:

1. **Add sections** — click "Add Section" in the sidebar, choose a type
2. **Fill in content** — click any section to open its form on the left
3. **Reorder** — drag sections up and down in the Sections tab
4. **Change theme** — go to the Theme tab, pick a preset or customize colors/font
5. **Import GitHub repos** — go to the GitHub tab, connect your account, check the repos you want, click Import (they appear in your Projects section)
6. **Preview** — click Preview in the top toolbar to see it exactly as visitors will
7. **Publish** — click Publish. Your portfolio is now live at `localhost:3000/your-slug`
8. **Export** — click Export for a ZIP file you can host anywhere for free

---

## API Overview

All endpoints are under `/api/v1`. Full interactive docs at `/api/docs`.

```
Auth         POST /auth/register, /auth/login, /auth/refresh, /auth/logout
             GET  /auth/me, /auth/github, /auth/github/callback

Users        GET  /users/me
             PATCH /users/me    (name, bio, avatar)
             DELETE /users/me

Portfolios   GET  /portfolios/mine
             POST /portfolios
             GET  /portfolios/:id
             PATCH /portfolios/:id
             DELETE /portfolios/:id
             POST /portfolios/:id/publish
             POST /portfolios/:id/unpublish
             GET  /portfolios/by-slug/:slug   (public)

Exports      POST /exports                    (queue job)
             GET  /exports/:id                (status)
             GET  /exports/:id/download       (download ZIP)

GitHub       GET  /github/status
             GET  /github/repos
             POST /github/sync
             DELETE /github/disconnect

Analytics    POST /analytics/track            (public)
             GET  /analytics/portfolio/:id

Themes       GET  /themes
```

**Rate limits:** `/auth/login`, `/auth/register`, `/auth/refresh` are throttled to **5 requests per minute** per IP. Everything else: 20 req/min.

---

## Database Migrations

In development, TypeORM auto-syncs the schema. In production, run migrations manually:

```bash
cd apps/api

# Run pending migrations
pnpm db:migrate

# Generate a new migration after changing an entity
pnpm db:migration:generate src/database/migrations/AddSomething
```

The initial migration (`1700000000000-InitialSchema.ts`) creates all tables and indexes from scratch. Run it when setting up a fresh production database.

---

## Running Tests

```bash
cd apps/api

pnpm test          # Run all unit tests
pnpm test:watch    # Watch mode (for when you're actively breaking things)
pnpm test:cov      # Coverage report
```

Tests cover:
- `AuthService` — register, login, refresh token, logout
- `PortfolioService` — 1-per-user limit, slug uniqueness, access control, publish/unpublish, cache invalidation

---

## Project Structure (detailed)

```
apps/api/src/
├── modules/
│   ├── auth/           JWT auth, bcrypt, GitHub OAuth, refresh tokens
│   ├── users/          Profile CRUD
│   ├── portfolio/      Portfolio CRUD, publish/unpublish, view counter, cache
│   ├── themes/         6 built-in theme presets
│   ├── export/         Queue producer + ZIP generation controller
│   ├── github/         OAuth token storage, repo fetch, sync to portfolio
│   └── analytics/      Event tracking, per-portfolio stats
├── database/
│   ├── entities/       TypeORM entities (User, Portfolio, ExportJob, AnalyticsEvent)
│   ├── migrations/     SQL migrations
│   └── data-source.ts  TypeORM DataSource for CLI
└── common/
    ├── guards/         JwtAuthGuard, ThrottlerGuard (global)
    └── decorators/     @CurrentUser(), @Public()

apps/web/src/
├── app/
│   ├── (auth)/         Login + Register pages
│   ├── dashboard/      Portfolio list, analytics, GitHub connection
│   ├── editor/[id]/    The main editor
│   ├── profile/        Edit name, bio, avatar
│   └── [slug]/         Public portfolio page (SSR)
├── components/editor/
│   ├── Editor.tsx      Toolbar, publish, export
│   ├── EditorSidebar.tsx Sections / Theme / GitHub / Settings tabs
│   ├── EditorCanvas.tsx  Live preview iframe
│   ├── SectionEditor.tsx Per-section form (typed, no `any`)
│   ├── SectionList.tsx   Drag & drop list
│   └── ThemePanel.tsx    Color pickers + presets
└── store/
    └── editor.store.ts   Zustand + zundo state

workers/export/src/
├── worker.ts           BullMQ worker, DB update logic
└── processors/
    └── export.processor.ts  ZIP generation

packages/shared/src/
├── schema/portfolio.ts  Zod schema — the single source of truth
└── types/index.ts       API response types, UserProfile, etc.
```

---

## Contributing

1. Fork it
2. Create a branch (`git checkout -b feat/your-feature`)
3. Make your changes
4. Run `pnpm test` — make sure nothing is broken
5. Submit a PR

There's a CI pipeline that will tell you if you broke something. It's not personal.

---

## License

MIT. Use it, fork it, sell it, tattoo it on your arm.

---

<div align="center">
  <sub>Built with too much coffee and a healthy disregard for the phrase "we'll add that later."</sub>
</div>
