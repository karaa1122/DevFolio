import type { MetadataRoute } from 'next';
import { DEMO_PROFILES, DEMO_RESUMES } from '@/lib/demo-data';

const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://devfolioapp.cloud';

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  return [
    { url: `${appUrl}/`, lastModified: now, changeFrequency: 'weekly', priority: 1 },
    { url: `${appUrl}/showcase`, lastModified: now, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${appUrl}/templates`, lastModified: now, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${appUrl}/resumes`, lastModified: now, changeFrequency: 'weekly', priority: 0.8 },
    ...DEMO_PROFILES.map((p) => ({
      url: `${appUrl}/showcase/${p.slug}`,
      lastModified: now,
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    })),
    ...DEMO_RESUMES.map((d) => ({
      url: `${appUrl}/resumes/${d.slug}`,
      lastModified: now,
      changeFrequency: 'monthly' as const,
      priority: 0.6,
    })),
    { url: `${appUrl}/login`, lastModified: now, changeFrequency: 'yearly', priority: 0.3 },
    { url: `${appUrl}/register`, lastModified: now, changeFrequency: 'yearly', priority: 0.5 },
  ];
}
