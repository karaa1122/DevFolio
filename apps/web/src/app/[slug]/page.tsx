import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { PortfolioRenderer } from '@devfolio/renderer';
import type { Portfolio, PortfolioResponse } from '@devfolio/shared';
import { PortfolioViewTracker } from '@/components/PortfolioViewTracker';
import { SectionViewTracker } from '@/components/SectionViewTracker';
import { serverApiBase } from '@/lib/api-server';

interface Props {
  params: { slug: string };
}

async function fetchPortfolio(slug: string): Promise<PortfolioResponse | null> {
  try {
    const apiUrl = serverApiBase();
    const res = await fetch(`${apiUrl}/api/v1/portfolios/by-slug/${slug}`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) return null;
    const json = await res.json();
    return (json.data ?? json) as PortfolioResponse;
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const entity = await fetchPortfolio(params.slug);
  if (!entity) return { title: 'Portfolio Not Found', robots: { index: false, follow: false } };

  const { metadata, sections } = entity.data;
  const hero = sections.find((s) => s.type === 'hero');
  const name = hero?.type === 'hero' ? hero.data.name : params.slug;
  const heroBio = hero?.type === 'hero' ? hero.data.bio : undefined;
  const description = metadata.description ?? heroBio;
  const canonical = `/${params.slug}`;
  const title = metadata.title ?? `${name} — Portfolio`;

  return {
    title,
    description,
    keywords: metadata.keywords,
    alternates: { canonical },
    robots: { index: true, follow: true, googleBot: { index: true, follow: true, 'max-image-preview': 'large' } },
    openGraph: {
      type: 'profile',
      url: canonical,
      title: metadata.title ?? name,
      description,
      images: metadata.ogImage ? [{ url: metadata.ogImage }] : [],
    },
    twitter: {
      card: 'summary_large_image',
      title: metadata.title ?? name,
      description,
      images: metadata.ogImage ? [metadata.ogImage] : [],
    },
    ...(metadata.gaTrackingId && {
      other: { 'google-analytics': metadata.gaTrackingId },
    }),
  };
}

export default async function PublicPortfolioPage({ params }: Props) {
  const entity = await fetchPortfolio(params.slug);

  if (!entity) {
    notFound();
  }

  const { sections, metadata } = entity.data;
  const hero = sections.find((s) => s.type === 'hero');
  const heroData = hero?.type === 'hero' ? hero.data : undefined;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://devfolioapp.cloud';

  // Structured data so search engines understand this is a person's profile.
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ProfilePage',
    dateModified: entity.updatedAt,
    mainEntity: {
      '@type': 'Person',
      name: heroData?.name ?? params.slug,
      jobTitle: heroData?.title,
      description: metadata.description ?? heroData?.bio,
      url: `${appUrl}/${params.slug}`,
      ...(heroData?.avatar && { image: heroData.avatar }),
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <PortfolioViewTracker portfolioId={entity.id} />
      <SectionViewTracker
        portfolioId={entity.id}
        sectionIds={entity.data.sections.map((s: { id: string }) => s.id)}
      />
      <PortfolioRenderer portfolio={entity.data} />
    </>
  );
}

export const dynamic = 'force-dynamic';
