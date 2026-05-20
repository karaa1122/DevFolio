import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { PortfolioRenderer } from '@devfolio/renderer';
import type { Portfolio, PortfolioResponse } from '@devfolio/shared';
import { PortfolioViewTracker } from '@/components/PortfolioViewTracker';
import { SectionViewTracker } from '@/components/SectionViewTracker';

interface Props {
  params: { slug: string };
}

async function fetchPortfolio(slug: string): Promise<PortfolioResponse | null> {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';
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
  if (!entity) return { title: 'Portfolio Not Found' };

  const { metadata, sections } = entity.data;
  const hero = sections.find((s) => s.type === 'hero');
  const name = hero?.type === 'hero' ? hero.data.name : params.slug;

  return {
    title: metadata.title ?? `${name} — Portfolio`,
    description: metadata.description ?? (hero?.type === 'hero' ? hero.data.bio : undefined),
    keywords: metadata.keywords,
    openGraph: {
      type: 'profile',
      title: metadata.title ?? name,
      description: metadata.description,
      images: metadata.ogImage ? [{ url: metadata.ogImage }] : [],
    },
    twitter: {
      card: 'summary_large_image',
      title: metadata.title ?? name,
      description: metadata.description,
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

  return (
    <>
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
