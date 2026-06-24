import type { MetadataRoute } from 'next';

const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://devfolioapp.cloud';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      // Keep authenticated/app surfaces out of the index.
      disallow: ['/dashboard', '/editor/', '/resume/', '/profile', '/auth/', '/login', '/register'],
    },
    sitemap: `${appUrl}/sitemap.xml`,
    host: appUrl,
  };
}
