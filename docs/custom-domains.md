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

## Infrastructure required (TLS / serving)

The app routes by `Host` header but does **not** provision TLS certificates for
user domains. You need a reverse proxy / edge in front of the Next.js app that
can obtain certificates on demand for verified domains. Two common options:

### Option A — Caddy with on-demand TLS (self-hosted)

Caddy can issue certificates per-host on first request, gated by an "ask"
endpoint so it only issues for domains DevFolio recognises. Sketch:

```caddyfile
{
    on_demand_tls {
        # Only issue a cert if this endpoint returns 2xx for ?domain=<host>.
        ask http://api:3001/api/v1/portfolios/by-domain
    }
}

https:// {
    tls {
        on_demand
    }
    reverse_proxy web:3000
}
```

`GET /portfolios/by-domain/:domain` already returns `200` only for a verified +
published domain and `404` otherwise, so it doubles as the on-demand "ask"
guard. (For strictness you may add a dedicated lightweight `HEAD` ask endpoint.)

### Option B — Managed platform

On Vercel / Netlify / Cloudflare for SaaS, add each verified domain to the
project via the platform API after verification succeeds (e.g. from
`verifyDomain`) and let the platform manage certificates. The in-app DNS TXT
verification can run in addition to, or instead of, the platform's own check.

## Local testing

Custom-domain routing can be exercised without real DNS:

1. Add a fake host to `/etc/hosts`: `127.0.0.1 test.localdomain`.
2. Set the portfolio's `customDomain` to `test.localdomain` and flip
   `domainVerified` to `true` directly in the DB (TXT lookup won't resolve for a
   fake host).
3. Visit `http://test.localdomain:3000`. The middleware rewrites it to
   `/sites/test.localdomain` and the portfolio renders.
