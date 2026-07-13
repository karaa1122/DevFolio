import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { PortfolioRenderer } from '@devfolio/renderer';
import { DEMO_PROFILES, getDemoProfile } from '@/lib/demo-data';

interface Props {
  params: { slug: string };
}

export function generateStaticParams() {
  return DEMO_PROFILES.map((p) => ({ slug: p.slug }));
}

export function generateMetadata({ params }: Props): Metadata {
  const demo = getDemoProfile(params.slug);
  if (!demo) return { title: 'Example not found' };
  const title = `${demo.name} — ${demo.title} Portfolio (Example)`;
  const description = `${demo.bio} An example developer portfolio built with DevFolio using the ${demo.template} template.`;
  return {
    title,
    description,
    alternates: { canonical: `/showcase/${demo.slug}` },
    openGraph: { title, description, type: 'profile', url: `/showcase/${demo.slug}` },
    twitter: { card: 'summary_large_image', title, description },
  };
}

export default function ShowcasePortfolioPage({ params }: Props) {
  const demo = getDemoProfile(params.slug);
  if (!demo) notFound();

  return (
    <>
      {/* Demo banner + conversion bar */}
      <div className="sticky top-0 z-[200] flex flex-wrap items-center justify-between gap-3 border-b border-line bg-ink/90 px-4 py-2.5 backdrop-blur-xl sm:px-6">
        <p className="text-xs text-content-muted sm:text-sm">
          <span className="mr-2 rounded-full bg-surface-3 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-content-faint">
            Demo
          </span>
          Example portfolio — <span className="text-content">{demo.name}</span> is not a real
          person.
        </p>
        <div className="flex items-center gap-2">
          <Link href="/showcase" className="df-btn df-btn-ghost px-3 py-1.5 text-xs">
            ← All examples
          </Link>
          <Link
            href={`/register?template=${demo.template}`}
            className="df-btn df-btn-primary px-4 py-1.5 text-xs"
          >
            Create similar
          </Link>
        </div>
      </div>

      <PortfolioRenderer portfolio={demo.portfolio} />
    </>
  );
}
