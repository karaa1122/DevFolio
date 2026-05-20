<div align="center">

# DevFolio

**The portfolio builder for developers who have been meaning to update their portfolio since 2019.**

Build it once. Publish in minutes. Never touch a CSS file again.

![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?logo=typescript&logoColor=white)
![Next.js](https://img.shields.io/badge/Next.js-14-black?logo=next.js)
![NestJS](https://img.shields.io/badge/NestJS-10-E0234E?logo=nestjs)
![License](https://img.shields.io/badge/license-MIT-green)
![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen)

<br/>

![DevFolio Portfolio Preview](./screenshots/portfolio.PNG)

</div>

---

## What Is This?

DevFolio is a **visual portfolio editor** for developers. You log in, drag sections around, pick a theme, write your bio, and publish. Your portfolio gets a public URL. Done. It's almost suspicious how simple that is.

No Webflow subscription. No WordPress plugin hell. No "I'll update my portfolio this weekend" for the 47th weekend in a row.

**Key ideas:**
- Your entire portfolio is one **JSON object** in the database — no HTML stored, ever
- The editor is a live preview — what you see is literally what gets rendered publicly
- Export to a static **ZIP file** (HTML + CSS) and host it anywhere for free
- Connect GitHub to auto-import your repos as portfolio projects

---

## Why DevFolio?

Most portfolio tools make you choose between control and convenience. You either get a drag-and-drop builder that locks you in forever, or a blank HTML file and a prayer.

DevFolio gives you both. Edit visually. Own your data. Export anytime. Your portfolio should not require emotional recovery to update.

| Pain | DevFolio |
|---|---|
| "I need to re-deploy every time I change a typo" | Auto-save + instant publish |
| "My portfolio is stuck on some platform I can't leave" | Export to static ZIP, host anywhere |
| "Setting up a portfolio takes a whole weekend" | Running in under 10 minutes |
| "I have to update my GitHub AND my portfolio separately" | GitHub integration syncs repos automatically |

---

## Screenshots

<table>
  <tr>
    <td><strong>Sign Up</strong></td>
    <td><strong>Login</strong></td>
  </tr>
  <tr>
    <td><img src="./screenshots/sign up.PNG" alt="Sign Up"/></td>
    <td><img src="./screenshots/login.PNG" alt="Login"/></td>
  </tr>
  <tr>
    <td><strong>Onboarding</strong></td>
    <td><strong>Profile</strong></td>
  </tr>
  <tr>
    <td><img src="./screenshots/onboarding.PNG" alt="Onboarding"/></td>
    <td><img src="./screenshots/profile.PNG" alt="Profile"/></td>
  </tr>
  <tr>
    <td><strong>Editor</strong></td>
    <td><strong>Live Portfolio</strong></td>
  </tr>
  <tr>
    <td><img src="./screenshots/port.PNG" alt="Editor"/></td>
    <td><img src="./screenshots/live.PNG" alt="Live Portfolio"/></td>
  </tr>
</table>

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
├── docker-compose.dev.yml  Dev stack (DB + Redis only)
└── .env.example          Start here
```

## Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | Next.js 14 (App Router), React 18, Tailwind CSS |
| **Editor state** | Zustand + zundo (50-step undo/redo) + @dnd-kit drag & drop |
| **Backend** | NestJS 10, TypeORM, PostgreSQL (JSONB), class-validator |
| **Auth** | JWT access + refresh tokens in httpOnly cookies, bcrypt, GitHub OAuth via Passport.js |
| **Cache** | Redis + cache-manager (portfolio pages cached 5 min) |
| **Queue** | BullMQ — export jobs, retry logic, concurrency control |
| **Export** | JSZip — generates self-contained HTML+CSS ZIP on-demand |
| **Monorepo** | pnpm workspaces + Turborepo |
| **Containers** | Docker + Docker Compose |

---

## ✨ Why JSON?

Most portfolio tools store HTML in the database. DevFolio stores a single **JSONB object** per portfolio. This is a deliberate architectural choice with real consequences:

**Renderer independence.** The JSON schema is the contract. The renderer (`packages/renderer`) is a separate React package that consumes it. Want a completely different visual style? Swap the renderer — the data doesn't move.

**Export portability.** Because your portfolio is data, not markup, the export worker can render it to any target format. Today that's a static HTML+CSS ZIP. Tomorrow it could be PDF, a different framework, or a third-party template marketplace.

**Schema validation.** Every portfolio write is validated against a Zod schema before it touches the database. Malformed data cannot enter the system — the schema is the single source of truth for both the API and the frontend.

**Future template support.** Switching templates will never require migrating your content. The data stays the same; only the renderer changes. Your bio doesn't care what font stack you're using.

**Simpler queries.** A portfolio is one row. Loading it is one query. The JSONB column gives you structured access and PostgreSQL indexing without a deeply normalized schema that requires six joins to render a page.

---

## 🏗 Rendering Flow

```mermaid
flowchart LR
    A[Editor] -->|PATCH /portfolios/:id| B[NestJS API]
    B -->|TypeORM| C[(PostgreSQL JSONB)]
    C -->|GET /portfolios/by-slug/:slug| D[Renderer]
    D --> E[Public Portfolio Page]

    B -->|BullMQ job| F[Export Worker]
    F -->|JSZip| G[Static ZIP\nindex.html + styles.css]
```

**Request path for a public portfolio visit:**
1. Browser hits `devfolioapp.cloud/your-slug`
2. Next.js SSR fetches portfolio JSON from the API
3. The `@devfolio/renderer` package renders it to React
4. Redis cache serves repeat visitors without hitting the database

---

## Features

### Editor

![Editor](./screenshots/port.PNG)

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

## 🧠 Design Philosophy

DevFolio is built around one idea: **developers should own their portfolio data.**

- **No vendor lock-in.** Export your portfolio as a static ZIP at any time. Host it on Netlify, GitHub Pages, S3, a Raspberry Pi, a USB stick — we genuinely don't mind.
- **Portable by design.** The JSON schema is open. If you want to build your own renderer or template, the data contract is documented and stable.
- **Open-source first.** The entire stack is MIT licensed. Self-host it, fork it, modify it. You don't need our servers.
- **Developers own their content.** Your bio, your projects, your experience — they live in a database you control. No "export request" forms. No waiting 30 days for a ZIP file.
- **Simplicity over features.** A portfolio tool that requires a PhD to configure defeats the purpose. Every feature in DevFolio exists because it removed friction, not added it.

---

## 🚀 Deployment

DevFolio ships as a fully containerized application. One `docker compose up` and everything is running.

| Target | How |
|---|---|
| **Local dev** | `docker compose -f docker-compose.dev.yml up -d` (DB + Redis only, run apps with `pnpm dev`) |
| **Self-hosted VPS / AWS EC2** | `docker compose up --build -d` — full stack in containers |
| **Static portfolio export** | Export ZIP → deploy to Netlify, Vercel, GitHub Pages, or any static host |

The production compose file includes health checks, restart policies, and structured JSON logging out of the box. No extra configuration needed to get a production-grade deployment.

---

## Prerequisites

Before you start, make sure you have:

- **Node.js** ≥ 20 — [nodejs.org](https://nodejs.org)
- **pnpm** ≥ 9 — `npm install -g pnpm`
- **Docker** — [docker.com](https://www.docker.com/products/docker-desktop) (for PostgreSQL + Redis)

That's it. No weird system dependencies. No global NestJS CLI required. You're welcome.

---

## Quick Start (Local Development)

### Step 1 — Clone and install

```bash
git clone https://github.com/karaa1122/DevFolio.git
cd DevFolio
pnpm install
```

### Step 2 — Set up environment variables

```bash
cp .env.example .env
```

Open `.env` and fill in at minimum:

```env
# Generate with: node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
JWT_SECRET=<64 hex chars>
JWT_REFRESH_SECRET=<different 64 hex chars>

# Required in production — safe to leave as-is for local dev
IP_HASH_SALT=<32 hex chars>
ENCRYPTION_KEY=<64 hex chars>

# Everything else (database URL, Redis, ports) works out of the box with Docker
```

> **GitHub OAuth is optional** — the app works fine without it. You only need it if you want the "Connect GitHub" feature. See [GitHub OAuth setup](#github-oauth-setup) below.

### Step 3 — Start the database and Redis

```bash
docker compose -f docker-compose.dev.yml up -d
```

This starts PostgreSQL on port `5432` and Redis on port `6379`.

### Step 4 — Run migrations

```bash
pnpm --filter @devfolio/api migration:run
```

Run this once on first setup, and again whenever you pull changes that include new migration files.

### Step 5 — Run everything

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

### Step 6 — Create your account

1. Go to http://localhost:3000
2. Click **Register** — fill in name, email, password
3. You're in. Create a portfolio, pick a slug, start building. The personal brand era begins.

---

## Full Docker Setup (Production-like)

If you want everything in containers — API, web, worker, database, Redis — all at once:

```bash
cp .env.example .env
# Edit .env — set proper secrets and your domain URLs

docker compose up --build -d
```

All services start with health checks and restart policies. The web app will be at http://localhost:3000.

**Run migrations after the first build:**

```bash
docker compose exec api node dist/database/migrate.js
```

```bash
docker compose logs -f api           # API logs (structured JSON)
docker compose logs -f web           # Next.js logs
docker compose logs -f export-worker # Export worker logs

docker compose down      # Stop everything
docker compose down -v   # Stop + wipe database volumes
```

---

## GitHub OAuth Setup

GitHub OAuth is optional but enables the "Connect GitHub → import repos" feature.

1. Go to [github.com/settings/developers](https://github.com/settings/developers)
2. Click **New OAuth App**
3. Fill in:
   - **Homepage URL**: `http://localhost:3000`
   - **Authorization callback URL**: `http://localhost:3001/api/v1/auth/github/callback`
4. Copy the **Client ID** and generate a **Client Secret**
5. Add them to your `.env`:
   ```env
   GITHUB_CLIENT_ID=your_client_id
   GITHUB_CLIENT_SECRET=your_client_secret
   GITHUB_CALLBACK_URL=http://localhost:3001/api/v1/auth/github/callback
   ```
6. Restart the API

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

## Security

- **httpOnly cookies** — JWT access and refresh tokens are stored in httpOnly, SameSite=Lax cookies. JavaScript cannot read them; XSS cannot steal them.
- **Token encryption** — GitHub OAuth access tokens are encrypted at rest with AES-256-GCM before being stored in the database (`ENCRYPTION_KEY`).
- **Account lockout** — 5 failed login attempts locks the account for 15 minutes.
- **Rate limiting** — auth endpoints (`/login`, `/register`, `/refresh`) are throttled to 5 req/min per IP. Everything else: 20 req/min.
- **IP hashing** — analytics visitor IPs are one-way hashed with SHA-256 + a secret salt before storage. No raw IPs ever hit the database.
- **CSP** — Helmet sets explicit Content-Security-Policy headers: no `unsafe-eval`, no `unsafe-inline` scripts.
- **Ownership checks** — analytics, export downloads, and portfolio operations verify that the requesting user owns the resource.
- **Reserved slugs** — `api`, `admin`, `dashboard`, `auth`, and others are blocked at portfolio creation.
- **Structured logging** — all API logs are emitted as JSON to stdout (level, timestamp, pid, context, message). No secrets in logs.

---

## Rate Limits

| Endpoint | Limit |
|---|---|
| `POST /auth/login` | 5 req / min |
| `POST /auth/register` | 5 req / min |
| `POST /auth/refresh` | 5 req / min |
| Everything else | 20 req / min |

---

## Database Migrations

Migrations are never run automatically — always run them manually. All commands work against your local DB by default (uses `DATABASE_URL` from `.env`).

```bash
# Apply all pending migrations
pnpm --filter @devfolio/api migration:run

# Generate a migration file from entity changes
pnpm --filter @devfolio/api migration:generate -- --name DescribeYourChange

# Create an empty migration file to write manually
pnpm --filter @devfolio/api migration:create -- DescribeYourChange

# Revert the last applied migration
pnpm --filter @devfolio/api migration:revert
```

Migration files live in `apps/api/src/database/migrations/` and are prefixed with a timestamp (e.g. `1748000000000-AddUserTable.ts`). Always commit them — they are the source of truth for your schema.

---

## Running Tests

```bash
cd apps/api

pnpm test          # Run all unit tests
pnpm test:watch    # Watch mode
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
│   ├── auth/           JWT auth, bcrypt, GitHub OAuth, refresh tokens, account lockout
│   ├── users/          Profile CRUD
│   ├── portfolio/      Portfolio CRUD, publish/unpublish, view counter, cache
│   ├── themes/         6 built-in theme presets
│   ├── export/         Queue producer + ZIP generation controller
│   ├── github/         OAuth token storage, repo fetch, sync to portfolio
│   ├── analytics/      Event tracking, per-portfolio stats, IP hashing
│   └── health/         GET /health — checks DB + Redis
├── database/
│   ├── entities/       TypeORM entities (User, Portfolio, ExportJob, AnalyticsEvent)
│   ├── migrations/     Migration files (timestamped, committed to source control)
│   └── data-source.ts  TypeORM DataSource for CLI
└── common/
    ├── decorators/     @CurrentUser(), @Public()
    ├── filters/        HttpExceptionFilter — catches all unhandled exceptions
    ├── guards/         JwtAuthGuard, ThrottlerGuard (global)
    ├── interceptors/   TransformInterceptor — wraps all responses in { data, ... }
    ├── logger/         JsonLogger — structured JSON to stdout
    ├── middleware/     RequestIdMiddleware — injects X-Request-ID header
    └── services/       EncryptionService — AES-256-GCM encrypt/decrypt

apps/web/src/
├── app/
│   ├── (auth)/         Login + Register pages
│   ├── dashboard/      Portfolio list, analytics
│   ├── editor/[id]/    The main editor
│   ├── profile/        Edit name, bio, avatar
│   ├── auth/callback/  GitHub OAuth exchange
│   └── [slug]/         Public portfolio page (SSR)
├── components/editor/
│   ├── Editor.tsx            Toolbar, publish, export
│   ├── EditorSidebar.tsx     Sections / Theme / GitHub / Settings tabs
│   ├── EditorCanvas.tsx      Live preview iframe
│   ├── SectionEditor.tsx     Per-section form (typed, no any)
│   ├── SectionList.tsx       Drag & drop list
│   └── ThemePanel.tsx        Color pickers + presets
└── store/
    └── editor.store.ts       Zustand + zundo state

workers/export/src/
├── worker.ts                 BullMQ worker, DB update logic
└── processors/
    └── export.processor.ts   ZIP generation

packages/shared/src/
├── schema/portfolio.ts       Zod schema — the single source of truth
└── types/index.ts            API response types, UserProfile, etc.
```

---

## 🗺 Roadmap

This is what's built, what's in progress, and what's coming:

- [x] Visual drag-and-drop editor
- [x] Live preview (same renderer as public page)
- [x] One-click publish with public URL
- [x] Static ZIP export
- [x] GitHub repo import
- [x] 6 built-in themes with full customization
- [x] Portfolio analytics (views, unique visitors)
- [x] JWT auth with refresh tokens + account lockout
- [x] Docker + Docker Compose deployment
- [ ] Custom domain support
- [ ] Multi-template marketplace
- [ ] AI-assisted bio and project description generation
- [ ] Portfolio analytics improvements (referrers, geography)
- [ ] PDF export
- [ ] Collaborative editing
- [ ] Team / org portfolios
- [ ] Plugin system for custom sections
- [ ] Mobile editor experience

---

## 🤝 Contributing

Contributions are welcome. Here's how to get involved without losing your mind.

### Getting started

1. Fork the repo and clone it locally
2. Follow the [Quick Start](#quick-start-local-development) to get it running
3. Pick an issue tagged `good first issue` or `help wanted`
4. Create a branch: `git checkout -b feat/your-feature` or `fix/your-bug`
5. Make your changes
6. Run `pnpm test` — make sure nothing is broken (yes, all of them)
7. Submit a PR — we promise to read it

### Branch naming

| Type | Pattern |
|---|---|
| Feature | `feat/description` |
| Bug fix | `fix/description` |
| Docs | `docs/description` |
| Refactor | `refactor/description` |

### Coding standards

- TypeScript everywhere — no `any` unless you have a very good excuse
- Zod for validation at boundaries — don't invent your own validation logic
- No raw SQL — use TypeORM query builder or entities
- Keep PRs focused — one thing per PR is always better than a 3,000-line diff

### Good first issues

Not sure where to start? Look for issues tagged:
- `good first issue` — scoped, well-defined, low risk
- `help wanted` — we know what needs doing but haven't gotten to it
- `docs` — documentation improvements, always appreciated

No contribution is too small. Fixing a typo in the README counts.

---

## License

MIT. Use it, fork it, sell it, tattoo it on your arm.

---

<div align="center">
  <sub>Built with too much coffee and a healthy disregard for the phrase "we'll add that later."</sub>
</div>
