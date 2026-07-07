'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { usePortfolioList } from '@/hooks/usePortfolio';
import { portfolioApi } from '@/lib/api';
import { TemplatePreview } from '@/components/templates/TemplatePreview';
import { PORTFOLIO_TEMPLATES, type PortfolioTemplateId } from '@devfolio/shared';
import { IconArrowRight, IconSparkle } from '@/components/icons';
import { Logo } from '@/components/Logo';

export default function TemplateMarketplacePage() {
  const router = useRouter();
  const { portfolios, isLoading, error, mutate } = usePortfolioList();
  const [applying, setApplying] = useState<PortfolioTemplateId | null>(null);
  const [applyError, setApplyError] = useState('');

  // A failed list request means the visitor isn't signed in — the gallery is
  // still browsable, only the apply action changes.
  const signedIn = !error;
  const portfolio = portfolios[0];
  const currentTemplate = portfolio?.data?.template ?? (portfolio ? 'aurora' : undefined);

  const handleUse = async (template: PortfolioTemplateId) => {
    if (!portfolio) return;
    setApplying(template);
    setApplyError('');
    try {
      await portfolioApi.update(portfolio.id, { template });
      await mutate();
      router.push(`/editor/${portfolio.id}`);
    } catch (err: unknown) {
      setApplyError(err instanceof Error ? err.message : 'Failed to apply template');
      setApplying(null);
    }
  };

  return (
    <div className="relative min-h-screen overflow-x-clip bg-ink text-content">
      <div className="pointer-events-none fixed left-1/2 top-[-14rem] -z-10 h-[34rem] w-[44rem] -translate-x-1/2 rounded-full bg-accent/8 blur-[150px]" />

      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-line bg-ink/70 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <Link href="/" aria-label="DevFolio home">
            <Logo withWordmark />
          </Link>
          <nav className="flex items-center gap-1.5">
            {signedIn ? (
              <Link
                href="/dashboard"
                className="rounded-lg px-3 py-2 text-sm font-medium text-content-muted transition-colors hover:text-content"
              >
                Dashboard
              </Link>
            ) : (
              <>
                <Link
                  href="/login"
                  className="rounded-lg px-3 py-2 text-sm font-medium text-content-muted transition-colors hover:text-content"
                >
                  Log in
                </Link>
                <Link href="/register" className="df-btn df-btn-primary px-4 py-2 text-sm">
                  Get started
                </Link>
              </>
            )}
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-12">
        {/* Hero */}
        <div className="mb-10 max-w-2xl">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-line bg-surface px-3 py-1 text-xs text-content-muted">
            <IconSparkle className="h-3.5 w-3.5 text-accent" />
            {PORTFOLIO_TEMPLATES.length} templates · all free
          </div>
          <h1 className="font-display text-4xl font-bold tracking-tight text-content">
            Template marketplace
          </h1>
          <p className="mt-3 text-content-muted">
            Pick a look for your portfolio. Templates change the layout chrome and typography —
            your sections, content, and custom colors carry over, and you can switch any time.
          </p>
        </div>

        {applyError && (
          <div className="mb-6 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
            {applyError}
          </div>
        )}

        {/* Gallery */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          {PORTFOLIO_TEMPLATES.map((meta) => {
            const isCurrent = meta.id === currentTemplate;
            return (
              <div key={meta.id} className="df-card df-card-hover overflow-hidden p-0">
                <TemplatePreview meta={meta} className="w-full border-b border-line text-[13px] sm:text-[15px]" />
                <div className="p-5">
                  <div className="mb-1.5 flex items-center gap-2">
                    <h2 className="font-display text-lg font-bold text-content">{meta.name}</h2>
                    <span className="rounded-full bg-accent/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-accent">
                      Free
                    </span>
                    {isCurrent && (
                      <span className="rounded-full bg-surface-3 px-2 py-0.5 text-[10px] font-medium text-content-muted">
                        Current
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-content-muted">{meta.description}</p>
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {meta.tags.map((tag) => (
                      <span key={tag} className="df-chip text-[11px]">
                        {tag}
                      </span>
                    ))}
                  </div>
                  <div className="mt-5">
                    {!signedIn ? (
                      <Link href="/register" className="df-btn df-btn-ghost w-full py-2.5 text-sm">
                        Sign up to use this template
                        <IconArrowRight className="h-3.5 w-3.5" />
                      </Link>
                    ) : !portfolio ? (
                      <Link
                        href="/dashboard"
                        className="df-btn df-btn-ghost w-full py-2.5 text-sm"
                      >
                        Create a portfolio to use it
                        <IconArrowRight className="h-3.5 w-3.5" />
                      </Link>
                    ) : isCurrent ? (
                      <Link
                        href={`/editor/${portfolio.id}`}
                        className="df-btn df-btn-ghost w-full py-2.5 text-sm"
                      >
                        Open in editor
                        <IconArrowRight className="h-3.5 w-3.5" />
                      </Link>
                    ) : (
                      <button
                        onClick={() => handleUse(meta.id)}
                        disabled={applying !== null || isLoading}
                        className="df-btn df-btn-primary w-full py-2.5 text-sm"
                      >
                        {applying === meta.id ? 'Applying…' : 'Use this template'}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <p className="mt-10 text-center text-sm text-content-faint">
          More templates are on the way — community submissions are planned.
        </p>
      </main>
    </div>
  );
}
