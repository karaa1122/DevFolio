'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { usePortfolioList } from '@/hooks/usePortfolio';
import { portfolioApi, githubApi, authApi, analyticsApi } from '@/lib/api';
import { slugify } from '@/lib/utils';
import useSWR from 'swr';
import type { PortfolioAnalytics } from '@devfolio/shared';

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';

export default function DashboardPage() {
  const router = useRouter();
  const { portfolios, isLoading, mutate } = usePortfolioList();
  const { data: githubStatus, mutate: mutateGithub } = useSWR(
    '/github/status',
    githubApi.status,
    { revalidateOnFocus: false },
  );

  const portfolioId = portfolios[0]?.id ?? null;
  const { data: analytics } = useSWR<PortfolioAnalytics>(
    portfolioId ? `/analytics/portfolio/${portfolioId}` : null,
    () => analyticsApi.getPortfolioStats(portfolioId!, 14),
    { revalidateOnFocus: false },
  );

  const handleLogout = async () => {
    try { await authApi.logout(); } catch { /* expired token is fine */ }
    localStorage.removeItem('devfolio_access_token');
    localStorage.removeItem('devfolio_refresh_token');
    router.push('/login');
  };

  const [creating, setCreating] = useState(false);
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
    <div className="min-h-screen bg-slate-950">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-900">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="text-xl font-bold text-violet-400">
            DevFolio
          </Link>
          <nav className="flex items-center gap-4">
            <Link href="/dashboard" className="text-slate-200 text-sm font-medium">
              Dashboard
            </Link>
            <Link href="/profile" className="text-slate-400 hover:text-slate-200 text-sm font-medium transition-colors">
              Profile
            </Link>
            <button
              onClick={handleLogout}
              className="text-sm text-slate-500 hover:text-red-400 border border-slate-700 hover:border-red-800 px-3 py-1.5 rounded-lg transition-colors"
            >
              Log out
            </button>
          </nav>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-12 space-y-10">
        {/* Portfolio section */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-slate-100">My Portfolio</h1>
              <p className="text-slate-400 mt-1">Build and manage your developer portfolio</p>
            </div>
            {!isLoading && portfolios.length === 0 && (
              <button
                onClick={() => setShowForm(true)}
                className="bg-violet-600 hover:bg-violet-500 text-white font-semibold px-5 py-2.5 rounded-xl text-sm transition-colors"
              >
                + Create Portfolio
              </button>
            )}
          </div>

          {/* Create form */}
          {showForm && (
            <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 mb-6">
              <h3 className="text-lg font-bold text-slate-100 mb-4">Create Portfolio</h3>
              {error && (
                <div className="bg-red-950/50 border border-red-900 text-red-400 text-sm px-4 py-3 rounded-lg mb-4">
                  {error}
                </div>
              )}
              <div className="flex gap-3">
                <div className="flex-1">
                  <div className="flex items-center bg-slate-800 border border-slate-700 rounded-lg overflow-hidden">
                    <span className="text-slate-500 text-sm pl-4 pr-1 whitespace-nowrap">devfolio.app/</span>
                    <input
                      type="text"
                      value={newSlug}
                      onChange={(e) => setNewSlug(slugify(e.target.value))}
                      placeholder="your-name"
                      className="flex-1 bg-transparent px-2 py-3 text-slate-100 focus:outline-none text-sm"
                    />
                  </div>
                </div>
                <button
                  onClick={handleCreate}
                  disabled={creating || !newSlug}
                  className="bg-violet-600 hover:bg-violet-500 disabled:opacity-50 text-white font-semibold px-6 py-3 rounded-lg text-sm transition-colors"
                >
                  {creating ? 'Creating...' : 'Create'}
                </button>
                <button
                  onClick={() => setShowForm(false)}
                  className="border border-slate-700 hover:border-slate-500 text-slate-400 px-4 py-3 rounded-lg text-sm transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Portfolio list */}
          {isLoading ? (
            <div className="text-center py-16 text-slate-500">Loading...</div>
          ) : portfolios.length === 0 ? (
            <div className="text-center py-24 border-2 border-dashed border-slate-800 rounded-2xl">
              <div className="text-4xl mb-4">🎨</div>
              <h3 className="text-xl font-bold text-slate-300 mb-2">No portfolio yet</h3>
              <p className="text-slate-500 mb-6">Create your portfolio to get started</p>
              <button
                onClick={() => setShowForm(true)}
                className="bg-violet-600 hover:bg-violet-500 text-white font-semibold px-6 py-3 rounded-xl transition-colors"
              >
                Create Portfolio
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {portfolios.map((portfolio) => (
                <div
                  key={portfolio.id}
                  className="bg-slate-900 border border-slate-800 rounded-2xl p-6 hover:border-violet-800/50 transition-all"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="font-bold text-slate-100 text-lg">
                        {portfolio.data?.metadata?.title ?? portfolio.data?.slug}
                      </h3>
                      <p className="text-violet-400 text-sm font-mono mt-0.5">
                        devfolio.app/{portfolio.data?.slug}
                      </p>
                    </div>
                    <span
                      className={`text-xs px-2.5 py-1 rounded-full font-medium shrink-0 ${
                        portfolio.isPublished
                          ? 'bg-green-950 text-green-400'
                          : 'bg-slate-800 text-slate-500'
                      }`}
                    >
                      {portfolio.isPublished ? 'Published' : 'Draft'}
                    </span>
                  </div>

                  <div className="text-xs text-slate-600 mb-5">
                    {portfolio.data?.sections?.length ?? 0} sections · v{portfolio.data?.version ?? 1} ·{' '}
                    {portfolio.viewCount} views
                  </div>

                  <div className="flex gap-2">
                    <Link
                      href={`/editor/${portfolio.id}`}
                      className="flex-1 text-center bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-medium py-2 rounded-lg transition-colors"
                    >
                      Edit
                    </Link>
                    {portfolio.isPublished && (
                      <Link
                        href={`/${portfolio.data?.slug}`}
                        target="_blank"
                        className="flex-1 text-center border border-slate-700 hover:border-violet-600 text-slate-400 hover:text-violet-400 text-sm font-medium py-2 rounded-lg transition-colors"
                      >
                        View Live ↗
                      </Link>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Analytics section — only shown when portfolio exists */}
        {analytics && (
          <div>
            <h2 className="text-xl font-bold text-slate-100 mb-4">Analytics <span className="text-slate-600 text-sm font-normal ml-1">last 14 days</span></h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <StatCard label="Total Views" value={analytics.totalViews} />
              <StatCard label="Unique Visitors" value={analytics.uniqueVisitors} />
              <StatCard label="Sections Tracked" value={analytics.topSections.length} />
            </div>

            {/* Sparkline */}
            {analytics.viewsByDay.length > 0 && (
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
                <p className="text-xs text-slate-500 mb-4">Page views per day</p>
                <MiniBarChart data={analytics.viewsByDay} />
              </div>
            )}
          </div>
        )}

        {/* GitHub section */}
        <div>
          <h2 className="text-xl font-bold text-slate-100 mb-1">GitHub</h2>
          <p className="text-slate-500 text-sm mb-4">
            Connect once here, then import repos inside the editor's{' '}
            <span className="text-violet-400 font-medium">GitHub tab</span>.
          </p>
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
            {!githubStatus ? (
              <div className="text-slate-500 text-sm">Checking connection...</div>
            ) : githubStatus.connected ? (
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-violet-900/50 border border-violet-700/50 flex items-center justify-center text-violet-400 font-bold text-sm">
                    GH
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-200">
                      Connected as <span className="text-violet-400">@{githubStatus.username}</span>
                    </p>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Open your portfolio in the editor → GitHub tab → select repos → Import
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleDisconnectGithub}
                  className="text-xs text-slate-600 hover:text-red-400 border border-slate-700 hover:border-red-800 px-3 py-1.5 rounded-lg transition-colors shrink-0"
                >
                  Disconnect
                </button>
              </div>
            ) : (
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div>
                  <p className="text-sm font-semibold text-slate-200">Connect your GitHub account</p>
                  <p className="text-xs text-slate-500 mt-1 max-w-sm">
                    Import your repositories as portfolio projects automatically — stars, language, description included.
                  </p>
                </div>
                <a
                  href={`${API_BASE}/api/v1/auth/github`}
                  className="bg-slate-800 hover:bg-slate-700 border border-slate-600 text-slate-200 text-sm font-medium px-5 py-2.5 rounded-lg transition-colors shrink-0 flex items-center gap-2"
                >
                  <span className="text-base">⬡</span> Connect GitHub
                </a>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

// ─── Analytics sub-components ──────────────────────────────────────────────

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
      <p className="text-xs text-slate-500 mb-1">{label}</p>
      <p className="text-3xl font-bold text-slate-100">{value.toLocaleString()}</p>
    </div>
  );
}

function MiniBarChart({ data }: { data: { date: string; views: number }[] }) {
  const max = Math.max(...data.map((d) => d.views), 1);
  return (
    <div className="flex items-end gap-1 h-16">
      {data.map((d) => (
        <div key={d.date} className="flex-1 flex flex-col items-center gap-1 group relative">
          <div
            className="w-full bg-violet-600/60 hover:bg-violet-500 rounded-sm transition-colors"
            style={{ height: `${Math.max((d.views / max) * 100, 4)}%` }}
          />
          {/* Tooltip on hover */}
          <div className="absolute bottom-full mb-1 left-1/2 -translate-x-1/2 bg-slate-800 border border-slate-700 text-xs text-slate-300 px-2 py-1 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
            {d.date.slice(5)}: {d.views} view{d.views !== 1 ? 's' : ''}
          </div>
        </div>
      ))}
    </div>
  );
}
