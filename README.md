# DevFolio

> Production-grade open-source developer portfolio builder platform.

DevFolio lets developers create, customize, publish, and export portfolios through a visual editor — with everything stored as a single Portfolio JSON object. No HTML in the database, ever.

## Architecture

```
devfolio/
├── apps/
│   ├── api/          — NestJS backend (8 modules)
│   └── web/          — Next.js 14 frontend (editor + SSR renderer)
├── packages/
│   ├── shared/       — Zod schema + TypeScript types
│   └── renderer/     — React portfolio renderer (shared by web + worker)
├── workers/
│   └── export/       — BullMQ export worker (JSON → static ZIP)
├── docker-compose.yml
└── docker-compose.dev.yml
```

## Tech Stack

| Layer         | Technology                                                  |
|---------------|-------------------------------------------------------------|
| Frontend      | Next.js 14 (App Router), React 18, TailwindCSS             |
| Editor state  | Zustand + zundo (undo/redo) + immer + @dnd-kit             |
| Backend       | NestJS, TypeORM, PostgreSQL (JSONB), class-validator       |
| Cache/Queues  | Redis, BullMQ                                               |
| Export        | BullMQ worker, ReactDOMServer, JSZip                       |
| Auth          | JWT (access + refresh tokens), GitHub OAuth (Passport.js)  |
| Monorepo      | pnpm workspaces + Turborepo                                 |
| Containers    | Docker + Docker Compose                                     |

## Portfolio JSON (single source of truth)

```json
{
  "id": "uuid",
  "slug": "karaa",
  "version": 1,
  "userId": "uuid",
  "theme": {
    "colors": { "primary": "#7c3aed", "background": "#0f172a" },
    "font": "inter",
    "radius": "md",
    "darkMode": true
  },
  "layout": { "sectionsOrder": ["hero-1", "about-1", "projects-1"] },
  "sections": [
    {
      "id": "hero-1",
      "type": "hero",
      "visible": true,
      "data": {
        "name": "Karaa Kamaran",
        "title": "Backend Engineer",
        "subtitle": "NestJS · Django · Microservices"
      }
    }
  ],
  "metadata": { "title": "Karaa Kamaran — Portfolio" }
}
```

## Quick Start

### Prerequisites

- Node.js ≥ 20
- pnpm ≥ 9
- Docker Desktop

### 1. Clone and install

```bash
git clone https://github.com/yourorg/devfolio.git
cd devfolio
cp .env.example .env
pnpm install
```

### 2. Start infrastructure

```bash
pnpm docker:up        # starts PostgreSQL + Redis
```

### 3. Run all apps

```bash
pnpm dev              # Turborepo starts all services concurrently
```

| Service        | URL                              |
|----------------|----------------------------------|
| Web App        | http://localhost:3000            |
| API            | http://localhost:3001/api/v1     |
| Swagger Docs   | http://localhost:3001/api/docs   |

### 4. Production (Docker Compose)

```bash
docker-compose up -d
```

## API Modules

| Module      | Routes                                            |
|-------------|---------------------------------------------------|
| `auth`      | POST /register, /login, /refresh, GET /me, GitHub OAuth |
| `users`     | GET/PATCH/DELETE /users/me                        |
| `portfolios`| CRUD + /publish /unpublish /by-slug/:slug         |
| `themes`    | GET /themes (6 built-in presets)                  |
| `exports`   | POST /exports → queues job; GET /exports/:id      |
| `github`    | GET /github/repos, POST /github/sync              |
| `analytics` | POST /analytics/track, GET /analytics/portfolio/:id |

## Section Types

| Type         | Description                                         |
|--------------|-----------------------------------------------------|
| `hero`       | Name, title, bio, avatar, CTA button                |
| `about`      | Bio text, highlights, optional image                |
| `projects`   | Grid/list/masonry layout, tags, live + repo links   |
| `skills`     | Tags, bars, or grid layout with optional levels     |
| `experience` | Timeline or cards, highlights per role              |
| `education`  | Institution, degree, GPA                            |
| `contact`    | Email, socials, optional contact form               |

## Editor Features

- **Visual drag & drop** — reorders `layout.sectionsOrder` only, never touches DOM directly
- **Live preview** — renders the Portfolio JSON through the same `PortfolioRenderer` used publicly
- **Undo / Redo** — 50-state history via `zundo` temporal middleware
- **Auto-save** — debounced 2s save to API on any change
- **Theme panel** — 6 presets + per-color pickers, font, radius, spacing

## Export Pipeline

```
Queue job (BullMQ)
  ↓
Export Worker picks up job
  ↓
Fetch Portfolio JSON from DB
  ↓
ReactDOMServer.renderToStaticMarkup
  ↓
Generate CSS from theme
  ↓
Bundle into ZIP (JSZip)
  ↓
Write to /uploads or S3
  ↓
Update export_jobs.file_url
```

Output structure:
```
portfolio.zip
├── index.html     ← Full self-contained HTML
├── styles.css     ← Generated from Portfolio theme
├── config.json    ← Export metadata
└── README.md      ← Deployment instructions
```

## Database Migrations

`synchronize: true` runs in development only. In production, run the migration before starting the API:

```bash
cd apps/api
pnpm db:migrate          # runs dist/database/migrations/*.js
```

Generate a new migration after entity changes:

```bash
pnpm db:migration:generate src/database/migrations/MyChange
```

## Testing

```bash
cd apps/api
pnpm test            # unit tests (Jest)
pnpm test:cov        # with coverage report
```

Tests cover `AuthService` (register, login, refresh, logout) and `PortfolioService` (create with 1-per-user limit, access control, publish/unpublish).

## CI

GitHub Actions runs on every push to `main`/`develop` and every PR:

- **API**: type-check + unit tests
- **Web**: type-check + production build
- **Export worker**: type-check

## Design Rules

1. **JSON is the single source of truth** — DB stores only JSONB, no HTML
2. **UI is a pure function of JSON** — renderer maps `section.type → React component`
3. **Editor never touches the DOM** — all changes mutate the JSON state
4. **Unknown section types are ignored** — renderer skips them safely
5. **Export is an independent system** — isolated worker, no shared process

## Environment Variables

See [.env.example](.env.example) for the full list.

## License

MIT — open source forever.
