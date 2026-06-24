import type { MetadataRoute } from 'next';

const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://devfolioapp.cloud';

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  return [
    { url: `${appUrl}/`, lastModified: now, changeFrequency: 'weekly', priority: 1 },
    { url: `${appUrl}/login`, lastModified: now, changeFrequency: 'yearly', priority: 0.3 },
    { url: `${appUrl}/register`, lastModified: now, changeFrequency: 'yearly', priority: 0.5 },
  ];
}
