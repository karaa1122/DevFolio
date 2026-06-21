import { NextResponse, type NextRequest } from 'next/server';

// The host(s) on which DevFolio's own app is served. Requests arriving on any
// other host are treated as a user's custom domain and rewritten to the
// portfolio that owns that domain.
const PRIMARY_HOST = (process.env.NEXT_PUBLIC_PRIMARY_HOST ?? 'devfolioapp.cloud').toLowerCase();

function isPrimaryHost(host: string): boolean {
  return (
    host === PRIMARY_HOST ||
    host.endsWith(`.${PRIMARY_HOST}`) ||
    host === 'localhost' ||
    host.startsWith('localhost:') ||
    host.startsWith('127.0.0.1') ||
    host.endsWith('.vercel.app') // preview deployments
  );
}

export function middleware(req: NextRequest) {
  const host = (req.headers.get('host') ?? '').toLowerCase().split(':')[0];

  // No host, or one of our own hosts: serve the app normally.
  if (!host || isPrimaryHost(host)) {
    return NextResponse.next();
  }

  // Custom domain: rewrite to the internal route that renders a portfolio by
  // its verified domain. Portfolios are single-page, so the path is ignored.
  const url = req.nextUrl.clone();
  url.pathname = `/sites/${host}`;
  return NextResponse.rewrite(url);
}

export const config = {
  // Run on everything except Next internals, the API proxy, and static files.
  matcher: ['/((?!_next/|api/|favicon.ico|robots.txt|sitemap.xml|.*\\..*).*)'],
};
