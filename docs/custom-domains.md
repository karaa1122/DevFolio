# Custom Domains

DevFolio lets a user serve their published portfolio on a domain they own
(e.g. `portfolio.janedoe.com`) instead of the default
`devfolioapp.cloud/<slug>` URL.

This document covers how the feature works and the **infrastructure required to
serve custom domains over HTTPS** — the application code handles routing and
verification, but TLS certificate issuance for arbitrary user domains must be
provided by the deployment layer.

## How it works

1. **Add a domain** — In the editor (Settings → Custom Domain) the user enters a
   domain. The API stores it (unverified) and returns DNS instructions:
   - a `TXT` record at `_devfolio-challenge.<domain>` containing a random token,
     used to prove ownership;
   - a `CNAME` record pointing `<domain>` at the DevFolio edge
     (`CUSTOM_DOMAIN_TARGET`, defaults to the primary host).
2. **Verify** — The user adds the records at their registrar and clicks Verify.
   The API resolves the TXT record (`dns.resolveTxt`) and, if the token matches,
   marks the domain `verified`.
3. **Serve** — A verified + published portfolio becomes reachable on the domain.
   The Next.js `middleware.ts` inspects the incoming `Host` header: any host
   that is not the primary host (or localhost / a `*.vercel.app` preview) is
   rewritten to `/sites/<host>`, which fetches the portfolio via
   `GET /api/v1/portfolios/by-domain/<host>` and renders it.

### Data model

`portfolios` gains: `customDomain` (unique), `domainVerified`,
`domainVerificationToken`, `domainVerifiedAt`. See migration
`1700000000005-AddCustomDomain`.

### API endpoints (owner only unless noted)

| Method | Path | Purpose |
| ------ | ---- | ------- |
| `GET`    | `/portfolios/:id/domain`        | Current status + DNS instructions |
| `PUT`    | `/portfolios/:id/domain`        | Set/change domain (rotates token) |
| `POST`   | `/portfolios/:id/domain/verify` | Verify ownership via TXT record |
| `DELETE` | `/portfolios/:id/domain`        | Detach domain |
| `GET`    | `/portfolios/by-domain/:domain` | Public lookup (verified + published) |

### Relevant environment variables

| Var | Where | Default | Meaning |
| --- | ----- | ------- | ------- |
| `APP_PRIMARY_HOST`     | API | `devfolioapp.cloud` | Host that cannot be claimed as a custom domain |
| `CUSTOM_DOMAIN_TARGET` | API | `APP_PRIMARY_HOST`  | CNAME target shown to users |
| `NEXT_PUBLIC_PRIMARY_HOST` | web | `devfolioapp.cloud` | Hosts served as the app (not rewritten) |

## Infrastructure (TLS / serving)

The app routes by `Host` header but does **not** provision TLS certificates
itself. That is handled by the **Caddy edge bundled in `docker-compose.yml`**
(config: [`infra/caddy/Caddyfile`](../infra/caddy/Caddyfile)), which terminates
TLS and reverse-proxies to the `web` / `api` containers.

### How certificates are issued

- **Primary hosts** (`devfolioapp.cloud`, `api.devfolioapp.cloud`,
  `www.devfolioapp.cloud`) get normal named Let's Encrypt certificates.
- **Custom domains** are served by a catch-all `https://` site with
  `tls { on_demand }`. Caddy obtains the certificate **on first request**,
  gated by an `ask` to the API so it only ever issues for domains DevFolio
  recognises:

  ```caddyfile
  on_demand_tls {
      ask http://api:3001/api/v1/portfolios/domain-check
  }
  ```

  `GET /portfolios/domain-check?domain=<host>` ([`portfolio.controller.ts`](../apps/api/src/modules/portfolio/portfolio.controller.ts))
  returns `200` only for a **verified + published** domain and `404` otherwise.
  Caddy appends `?domain=<sni>` automatically, treating `2xx` as "issue".

The result is fully self-service: a user adds their domain, points DNS, and
clicks **Verify** — the certificate is provisioned automatically on the first
visit. **No per-domain server work.**

Set `ACME_EMAIL` in `.env` for Let's Encrypt expiry notices.

### Cutover from a manual nginx edge

If a host was previously serving the primary domain via a hand-configured
nginx + certbot, switch it to Caddy (Caddy needs ports 80/443, which nginx
holds):

```bash
sudo systemctl disable --now nginx     # free 80/443
docker compose pull && docker compose up -d   # brings up the caddy service
docker compose logs -f caddy           # watch it obtain certs
```

Caddy issues its own certificates via ACME, so the old certbot certs are no
longer needed. Any per-domain nginx vhosts added during the manual era can be
deleted.

### Alternative — managed platform

Instead of self-hosting Caddy you can use Vercel / Netlify / Cloudflare for
SaaS: add each verified domain to the project via the platform API after
verification succeeds and let the platform manage certificates. The in-app DNS
TXT verification can run in addition to, or instead of, the platform's check.

## Local testing

Custom-domain routing can be exercised without real DNS:

1. Add a fake host to `/etc/hosts`: `127.0.0.1 test.localdomain`.
2. Set the portfolio's `customDomain` to `test.localdomain` and flip
   `domainVerified` to `true` directly in the DB (TXT lookup won't resolve for a
   fake host).
3. Visit `http://test.localdomain:3000`. The middleware rewrites it to
   `/sites/test.localdomain` and the portfolio renders.
