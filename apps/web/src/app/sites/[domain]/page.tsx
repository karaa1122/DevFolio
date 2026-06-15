import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { PortfolioRenderer } from '@devfolio/renderer';
import type { PortfolioResponse } from '@devfolio/shared';
import { PortfolioViewTracker } from '@/components/PortfolioViewTracker';
import { SectionViewTracker } from '@/components/SectionViewTracker';
import { serverApiBase } from '@/lib/api-server';

interface Props {
  params: { domain: string };
}

async function fetchPortfolioByDomain(domain: string): Promise<PortfolioResponse | null> {
  try {
    const apiUrl = serverApiBase();
    const res = await fetch(`${apiUrl}/api/v1/portfolios/by-domain/${encodeURIComponent(domain)}`, {
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
  const entity = await fetchPortfolioByDomain(params.domain);
  if (!entity) return { title: 'Portfolio Not Found' };

  const { metadata, sections } = entity.data;
  const hero = sections.find((s) => s.type === 'hero');
  const name = hero?.type === 'hero' ? hero.data.name : params.domain;

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

export default async function CustomDomainPortfolioPage({ params }: Props) {
  const entity = await fetchPortfolioByDomain(params.domain);

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
