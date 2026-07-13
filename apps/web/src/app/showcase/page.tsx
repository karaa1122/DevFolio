import Link from 'next/link';
import type { Metadata } from 'next';
import { DEMO_CATEGORIES, DEMO_PROFILES, type DemoCategory } from '@/lib/demo-data';
import { getPortfolioTemplate } from '@devfolio/shared';
import { PublicNav } from '@/components/PublicNav';
import { IconArrowRight, IconSparkle } from '@/components/icons';

export const metadata: Metadata = {
  title: 'Developer Portfolio Examples — DevFolio Showcase',
  description:
    'Browse example developer portfolios built with DevFolio: backend, frontend, full stack, student and DevOps profiles. See a template you like and create your own in minutes.',
  alternates: { canonical: '/showcase' },
  openGraph: {
    title: 'Developer Portfolio Examples — DevFolio Showcase',
    description:
      'Real-looking example portfolios across five developer roles. Pick one, click Create Similar, and make it yours.',
    type: 'website',
    url: '/showcase',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Developer Portfolio Examples — DevFolio Showcase',
    description: 'Example developer portfolios across five roles, built with DevFolio.',
  },
};

interface Props {
  searchParams: { category?: string };
}

export default function ShowcasePage({ searchParams }: Props) {
  const active = DEMO_CATEGORIES.includes(searchParams.category as DemoCategory)
    ? (searchParams.category as DemoCategory)
    : null;
  const profiles = active ? DEMO_PROFILES.filter((p) => p.category === active) : DEMO_PROFILES;

  return (
    <div className="relative min-h-screen overflow-x-clip bg-ink text-content">
      <div className="pointer-events-none fixed left-1/2 top-[-14rem] -z-10 h-[34rem] w-[44rem] -translate-x-1/2 rounded-full bg-accent/8 blur-[150px]" />
      <PublicNav active="showcase" />

      <main className="mx-auto max-w-6xl px-6 py-12">
        <div className="mb-8 max-w-2xl">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-line bg-surface px-3 py-1 text-xs text-content-muted">
            <IconSparkle className="h-3.5 w-3.5 text-accent" />
            {DEMO_PROFILES.length} example portfolios · demo profiles
          </div>
          <h1 className="font-display text-4xl font-bold tracking-tight">Portfolio showcase</h1>
          <p className="mt-3 text-content-muted">
            Example portfolios built with DevFolio — every one uses a real template and renders
            through the same engine as live user sites. Find your role, open one, then create
            yours from the same starting point.
          </p>
        </div>

        {/* Category filter — plain links, SSR friendly */}
        <div className="mb-10 flex flex-wrap gap-2">
          <Link
            href="/showcase"
            className={`rounded-full border px-4 py-1.5 text-sm transition-colors ${
              !active
                ? 'border-accent bg-accent/15 text-accent'
                : 'border-line text-content-muted hover:border-accent/40 hover:text-content'
            }`}
          >
            All
          </Link>
          {DEMO_CATEGORIES.map((c) => (
            <Link
              key={c}
              href={`/showcase?category=${encodeURIComponent(c)}`}
              className={`rounded-full border px-4 py-1.5 text-sm transition-colors ${
                active === c
                  ? 'border-accent bg-accent/15 text-accent'
                  : 'border-line text-content-muted hover:border-accent/40 hover:text-content'
              }`}
            >
              {c}
            </Link>
          ))}
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {profiles.map((p) => {
            const template = getPortfolioTemplate(p.template);
            const colors = template.suggestedTheme.colors;
            return (
              <article key={p.slug} className="df-card df-card-hover flex flex-col p-6">
                <div className="mb-4 flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3.5">
                    {/* Initials avatar in the template's palette */}
                    <span
                      className="grid h-12 w-12 shrink-0 place-items-center rounded-xl font-display text-sm font-bold"
                      style={{
                        background: `linear-gradient(135deg, ${colors.primary}, ${colors.accent})`,
                        color: colors.background,
                      }}
                    >
                      {p.name.split(' ').map((w) => w[0]).join('')}
                    </span>
                    <div>
                      <h2 className="font-display text-lg font-bold leading-tight">{p.name}</h2>
                      <p className="text-sm text-content-muted">{p.title}</p>
                    </div>
                  </div>
                  <span className="shrink-0 rounded-full bg-surface-3 px-2.5 py-1 text-[10px] font-medium uppercase tracking-wide text-content-faint">
                    Demo
                  </span>
                </div>

                <p className="text-sm leading-relaxed text-content-muted">{p.bio}</p>

                <div className="mt-4 flex flex-wrap gap-1.5">
                  {p.skills.map((s) => (
                    <span key={s} className="df-chip text-[11px]">
                      {s}
                    </span>
                  ))}
                </div>

                <div className="mt-4 space-y-1 text-xs text-content-faint">
                  {p.featuredProjects.map((proj) => (
                    <p key={proj} className="truncate">
                      <span className="text-accent">▸</span> {proj}
                    </p>
                  ))}
                </div>

                <div className="mt-5 flex items-center justify-between border-t border-line pt-4">
                  <span className="text-xs text-content-faint">
                    Template:{' '}
                    <Link href="/templates" className="font-medium text-content-muted hover:text-accent">
                      {template.name}
                    </Link>
                  </span>
                  <div className="flex gap-2">
                    <Link
                      href={`/showcase/${p.slug}`}
                      className="df-btn df-btn-ghost px-4 py-2 text-xs"
                    >
                      View portfolio
                    </Link>
                    <Link
                      href={`/register?template=${p.template}`}
                      className="df-btn df-btn-primary px-4 py-2 text-xs"
                    >
                      Create similar
                    </Link>
                  </div>
                </div>
              </article>
            );
          })}
        </div>

        <div className="mt-14 rounded-2xl border border-line bg-surface p-8 text-center">
          <h2 className="font-display text-2xl font-bold">Yours could be next</h2>
          <p className="mx-auto mt-2 max-w-md text-sm text-content-muted">
            Every example here took minutes, not weekends. Import your GitHub repos, pick a
            template, publish.
          </p>
          <Link href="/register" className="df-btn df-btn-primary mt-6 px-6 py-3 text-sm">
            Create your portfolio free
            <IconArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </main>
    </div>
  );
}
