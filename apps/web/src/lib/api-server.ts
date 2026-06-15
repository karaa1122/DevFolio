/**
 * Base URL for **server-side** (SSR / server component) calls to the API.
 *
 * The browser reaches the API at `NEXT_PUBLIC_API_URL` (e.g. http://localhost:3001),
 * but server components run inside the web container, where `localhost` is the
 * web container itself — not the API. In Docker the API is reachable on the
 * compose network as `http://api:3001`, so SSR must prefer `INTERNAL_API_URL`.
 */
export function serverApiBase(): string {
  return (
    process.env.INTERNAL_API_URL ?? process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001'
  );
}
