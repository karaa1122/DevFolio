'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { usePortfolioList } from '@/hooks/usePortfolio';
import { useResumeList } from '@/hooks/useResume';
import { portfolioApi, githubApi, authApi } from '@/lib/api';
import { CustomDomainManager } from '@/components/CustomDomainManager';
import { slugify } from '@/lib/utils';
import {
  IconArrowRight,
  IconEdit,
  IconExternal,
  IconGithub,
  IconLogout,
  IconPlus,
  IconSparkle,
} from '@/components/icons';
import { Logo } from '@/components/Logo';
import useSWR from 'swr';

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';

export default function DashboardPage() {
  const router = useRouter();
  const { portfolios, isLoading, mutate } = usePortfolioList();
  const { resumes, isLoading: resumesLoading } = useResumeList();
  const { data: githubStatus, mutate: mutateGithub } = useSWR('/github/status', githubApi.status, {
    revalidateOnFocus: false,
  });

  const [creating, setCreating] = useState(false);
  const [editingSlugId, setEditingSlugId] = useState<string | null>(null);
  const [slugInput, setSlugInput] = useState('');
  const [slugError, setSlugError] = useState('');
  const [slugSaving, setSlugSaving] = useState(false);

  const startEditSlug = (id: string, current: string) => {
    setEditingSlugId(id);
    setSlugInput(current);
    setSlugError('');
  };

  const saveSlug = async (id: string) => {
    if (!slugInput.trim() || slugInput === '') return;
    setSlugSaving(true);
    setSlugError('');
    try {
      await portfolioApi.updateSlug(id, slugInput.trim());
      await mutate();
      setEditingSlugId(null);
    } catch (err: unknown) {
      setSlugError(err instanceof Error ? err.message : 'Failed to update slug');
    } finally {
      setSlugSaving(false);
    }
  };

  const handleLogout = async () => {
    try {
      await authApi.logout();
    } catch {
      /* expired token is fine */
    }
    router.push('/login');
  };
  const [showForm, setShowForm] = useState(false);
  const [newSlug, setNewSlug] = useState('');
  const [error, setError] = useState('');

  const handleCreate = async () => {
    if (!newSlug.trim()) return;
    setCreating(true);
    setError('');
    try {
      const portfolio = await portfolioApi.create({ slug: newSlug.trim() });
      await mutate();
      router.push(`/editor/${portfolio.id}`);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to create portfolio');
    } finally {
      setCreating(false);
    }
  };

  const handleDisconnectGithub = async () => {
    await githubApi.disconnect();
    mutateGithub();
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
            <Link href="/dashboard" className="rounded-lg px-3 py-2 text-sm font-medium text-content">
              Dashboard
            </Link>
            <Link
              href="/resume"
              className="rounded-lg px-3 py-2 text-sm font-medium text-content-muted transition-colors hover:text-content"
            >
              Resumes
            </Link>
            <Link
              href="/profile"
              className="rounded-lg px-3 py-2 text-sm font-medium text-content-muted transition-colors hover:text-content"
            >
              Profile
            </Link>
            <button
              onClick={handleLogout}
              className="ml-1 inline-flex items-center gap-1.5 rounded-lg border border-line px-3 py-1.5 text-sm text-content-faint transition-colors hover:border-red-500/40 hover:text-red-400"
            >
              <IconLogout className="h-4 w-4" />
              Log out
            </button>
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-6xl space-y-14 px-6 py-12">
        {/* Portfolio section */}
        <div>
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h1 className="font-display text-3xl font-bold tracking-tight text-content">
                My Portfolio
              </h1>
              <p className="mt-1 text-content-muted">Build and manage your developer portfolio</p>
            </div>
            {!isLoading && portfolios.length === 0 && (
              <button onClick={() => setShowForm(true)} className="df-btn df-btn-primary px-5 py-2.5 text-sm">
                <IconPlus className="h-4 w-4" />
                Create Portfolio
              </button>
            )}
          </div>

          {/* Create form */}
          {showForm && (
            <div className="df-card mb-6 p-6">
              <h3 className="mb-4 font-display text-lg font-bold text-content">Create Portfolio</h3>
              {error && (
                <div className="mb-4 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                  {error}
                </div>
              )}
              <div className="flex gap-3">
                <div className="flex-1">
                  <div className="flex items-center overflow-hidden rounded-xl border border-line bg-surface focus-within:border-accent/50">
                    <span className="whitespace-nowrap pl-4 pr-1 text-sm text-content-faint">
                      devfolioapp.cloud/
                    </span>
                    <input
                      type="text"
                      value={newSlug}
                      onChange={(e) => setNewSlug(slugify(e.target.value))}
                      placeholder="your-name"
                      className="flex-1 bg-transparent px-2 py-3 text-sm text-content focus:outline-none"
                    />
                  </div>
                </div>
                <button onClick={handleCreate} disabled={creating || !newSlug} className="df-btn df-btn-primary px-6 text-sm">
                  {creating ? 'Creating...' : 'Create'}
                </button>
                <button onClick={() => setShowForm(false)} className="df-btn df-btn-ghost px-4 text-sm">
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Portfolio list */}
          {isLoading ? (
            <div className="py-16 text-center text-content-faint">Loading...</div>
          ) : portfolios.length === 0 ? (
            <div className="rounded-2xl border-2 border-dashed border-line py-24 text-center">
              <div className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-2xl bg-accent/10 text-accent">
                <IconSparkle className="h-7 w-7" />
              </div>
              <h3 className="mb-2 font-display text-xl font-bold text-content">No portfolio yet</h3>
              <p className="mb-6 text-content-faint">Create your portfolio to get started</p>
              <button onClick={() => setShowForm(true)} className="df-btn df-btn-primary mx-auto px-6 py-3">
                <IconPlus className="h-4 w-4" />
                Create Portfolio
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {portfolios.map((portfolio) => (
                <div key={portfolio.id} className="df-card df-card-hover p-6">
                  <div className="mb-4 flex items-start justify-between">
                    <div className="mr-3 min-w-0 flex-1">
                      <h3 className="font-display text-lg font-bold text-content">
                        {portfolio.data?.metadata?.title ?? portfolio.data?.slug}
                      </h3>
                      {editingSlugId === portfolio.id ? (
                        <div className="mt-1.5">
                          <div className="flex items-center overflow-hidden rounded-lg border border-accent/60 bg-surface text-sm">
                            <span className="whitespace-nowrap pl-2.5 pr-1 text-content-faint">devfolioapp.cloud/</span>
                            <input
                              autoFocus
                              value={slugInput}
                              onChange={(e) => setSlugInput(slugify(e.target.value))}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') saveSlug(portfolio.id);
                                if (e.key === 'Escape') setEditingSlugId(null);
                              }}
                              className="min-w-0 flex-1 bg-transparent py-1.5 pr-2 text-content focus:outline-none"
                            />
                          </div>
                          {slugError && <p className="mt-1 text-xs text-red-400">{slugError}</p>}
                          <div className="mt-1.5 flex gap-2">
                            <button
                              onClick={() => saveSlug(portfolio.id)}
                              disabled={slugSaving || !slugInput}
                              className="df-btn df-btn-primary px-3 py-1 text-xs"
                            >
                              {slugSaving ? 'Saving…' : 'Save'}
                            </button>
                            <button
                              onClick={() => setEditingSlugId(null)}
                              className="px-2 py-1 text-xs text-content-faint transition-colors hover:text-content"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <button
                          onClick={() => startEditSlug(portfolio.id, portfolio.data?.slug ?? '')}
                          className="group mt-0.5 flex items-center gap-1.5"
                        >
                          <span className="font-mono text-sm text-accent">
                            devfolioapp.cloud/{portfolio.data?.slug}
                          </span>
                          <IconEdit className="h-3 w-3 text-content-faint transition-colors group-hover:text-accent" />
                        </button>
                      )}
                    </div>
                    <span
                      className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-medium ${
                        portfolio.isPublished
                          ? 'bg-accent/15 text-accent'
                          : 'bg-surface-3 text-content-faint'
                      }`}
                    >
                      {portfolio.isPublished ? 'Published' : 'Draft'}
                    </span>
                  </div>

                  <div className="mb-5 text-xs text-content-faint">
                    {portfolio.data?.sections?.length ?? 0} sections · v
                    {portfolio.data?.version ?? 1}
                  </div>

                  <div className="flex gap-2">
                    <Link
                      href={`/editor/${portfolio.id}`}
                      className="df-btn df-btn-ghost flex-1 py-2 text-sm"
                    >
                      <IconEdit className="h-3.5 w-3.5" />
                      Edit
                    </Link>
                    {portfolio.isPublished && (
                      <Link
                        href={`/${portfolio.data?.slug}`}
                        target="_blank"
                        className="df-btn flex-1 border border-line py-2 text-sm text-content-muted transition-colors hover:border-accent/50 hover:text-accent"
                      >
                        View Live
                        <IconExternal className="h-3.5 w-3.5" />
                      </Link>
                    )}
                  </div>

                  <CustomDomainManager portfolioId={portfolio.id} />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Resumes section */}
        <div>
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h2 className="font-display text-xl font-bold text-content">My Resumes</h2>
              <p className="mt-1 text-sm text-content-faint">
                One per application — each exports to a print-perfect PDF.
              </p>
            </div>
            <Link
              href="/resume"
              className="df-btn border border-line px-3 py-1.5 text-sm text-content-muted transition-colors hover:border-accent/40 hover:text-accent"
            >
              View all
              <IconArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          {resumesLoading ? (
            <div className="py-8 text-center text-sm text-content-faint">Loading…</div>
          ) : resumes.length === 0 ? (
            <Link
              href="/resume"
              className="group block rounded-2xl border-2 border-dashed border-line py-12 text-center transition-colors hover:border-accent/40"
            >
              <div className="mx-auto mb-3 grid h-12 w-12 place-items-center rounded-xl bg-accent/10 text-accent transition-transform group-hover:scale-110">
                <IconPlus className="h-6 w-6" />
              </div>
              <h3 className="mb-1 font-display text-base font-semibold text-content transition-colors group-hover:text-accent">
                No resumes yet
              </h3>
              <p className="text-xs text-content-faint">Click to create your first resume</p>
            </Link>
          ) : (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              {resumes.slice(0, 6).map((r) => {
                const resumeTitle = r.data.metadata?.title ?? r.slug;
                const role = r.data.metadata?.targetRole;
                return (
                  <Link
                    key={r.id}
                    href={`/resume/${r.id}`}
                    className="df-card df-card-hover group p-5"
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex h-12 w-10 shrink-0 flex-col gap-0.5 rounded-md bg-white/95 p-1.5 shadow-lg shadow-accent/10">
                        <div className="h-1 w-3/4 rounded-full bg-slate-300" />
                        <div className="h-0.5 w-1/2 rounded-full bg-slate-300" />
                        <div className="mt-1 h-0.5 w-full rounded-full bg-slate-200" />
                        <div className="h-0.5 w-5/6 rounded-full bg-slate-200" />
                        <div className="h-0.5 w-4/6 rounded-full bg-slate-200" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="truncate font-display font-semibold text-content transition-colors group-hover:text-accent">
                          {resumeTitle}
                        </h3>
                        <p className="mt-0.5 truncate font-mono text-xs text-content-faint">
                          {r.slug}
                        </p>
                      </div>
                    </div>
                    <div className="mt-4 flex items-center gap-2 text-[11px] text-content-faint">
                      <span className="rounded-full bg-surface-3 px-2 py-0.5 capitalize text-content-muted">
                        {r.data.template}
                      </span>
                      <span>·</span>
                      <span>{r.data.sections.length} sections</span>
                      {role && (
                        <>
                          <span>·</span>
                          <span className="truncate">{role}</span>
                        </>
                      )}
                    </div>
                  </Link>
                );
              })}
              {resumes.length < 6 && (
                <Link
                  href="/resume"
                  className="flex min-h-[120px] flex-col items-center justify-center rounded-2xl border-2 border-dashed border-line text-content-faint transition-colors hover:border-accent/40 hover:text-accent"
                >
                  <IconPlus className="mb-1 h-6 w-6" />
                  <span className="text-xs font-medium">New resume</span>
                </Link>
              )}
            </div>
          )}
        </div>

        {/* GitHub section */}
        <div>
          <h2 className="mb-1 font-display text-xl font-bold text-content">GitHub</h2>
          <p className="mb-4 text-sm text-content-faint">
            Connect once here, then import repos inside the editor&apos;s{' '}
            <span className="font-medium text-accent">GitHub tab</span>.
          </p>
          <div className="df-card p-6">
            {!githubStatus ? (
              <div className="text-sm text-content-faint">Checking connection...</div>
            ) : githubStatus.connected ? (
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="grid h-10 w-10 place-items-center rounded-full bg-accent/10 text-accent">
                    <IconGithub className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-content">
                      Connected as <span className="text-accent">@{githubStatus.username}</span>
                    </p>
                    <p className="mt-0.5 text-xs text-content-faint">
                      Open your portfolio in the editor → GitHub tab → select repos → Import
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleDisconnectGithub}
                  className="shrink-0 rounded-lg border border-line px-3 py-1.5 text-xs text-content-faint transition-colors hover:border-red-500/40 hover:text-red-400"
                >
                  Disconnect
                </button>
              </div>
            ) : (
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold text-content">Connect your GitHub account</p>
                  <p className="mt-1 max-w-sm text-xs text-content-faint">
                    Import your repositories as portfolio projects automatically — stars, language,
                    description included.
                  </p>
                </div>
                <a href={`${API_BASE}/api/v1/auth/github`} className="df-btn df-btn-ghost shrink-0 px-5 py-2.5 text-sm">
                  <IconGithub className="h-4 w-4" /> Connect GitHub
                </a>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
