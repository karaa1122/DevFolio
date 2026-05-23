'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { usePortfolioList } from '@/hooks/usePortfolio';
import { useResumeList } from '@/hooks/useResume';
import { portfolioApi, githubApi, authApi } from '@/lib/api';
import { slugify } from '@/lib/utils';
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
            <Link
              href="/resume"
              className="text-slate-400 hover:text-slate-200 text-sm font-medium transition-colors"
            >
              Resumes
            </Link>
            <Link
              href="/profile"
              className="text-slate-400 hover:text-slate-200 text-sm font-medium transition-colors"
            >
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
                    <span className="text-slate-500 text-sm pl-4 pr-1 whitespace-nowrap">
                      devfolioapp.cloud/
                    </span>
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
                    <div className="flex-1 min-w-0 mr-3">
                      <h3 className="font-bold text-slate-100 text-lg">
                        {portfolio.data?.metadata?.title ?? portfolio.data?.slug}
                      </h3>
                      {editingSlugId === portfolio.id ? (
                        <div className="mt-1.5">
                          <div className="flex items-center bg-slate-800 border border-violet-500 rounded-lg overflow-hidden text-sm">
                            <span className="text-slate-500 pl-2.5 pr-1 whitespace-nowrap">devfolioapp.cloud/</span>
                            <input
                              autoFocus
                              value={slugInput}
                              onChange={(e) => setSlugInput(slugify(e.target.value))}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') saveSlug(portfolio.id);
                                if (e.key === 'Escape') setEditingSlugId(null);
                              }}
                              className="flex-1 bg-transparent py-1.5 pr-2 text-slate-100 focus:outline-none min-w-0"
                            />
                          </div>
                          {slugError && <p className="text-red-400 text-xs mt-1">{slugError}</p>}
                          <div className="flex gap-2 mt-1.5">
                            <button
                              onClick={() => saveSlug(portfolio.id)}
                              disabled={slugSaving || !slugInput}
                              className="text-xs bg-violet-600 hover:bg-violet-500 disabled:opacity-50 text-white px-3 py-1 rounded-md transition-colors"
                            >
                              {slugSaving ? 'Saving…' : 'Save'}
                            </button>
                            <button
                              onClick={() => setEditingSlugId(null)}
                              className="text-xs text-slate-500 hover:text-slate-300 px-2 py-1 transition-colors"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <button
                          onClick={() => startEditSlug(portfolio.id, portfolio.data?.slug ?? '')}
                          className="group flex items-center gap-1.5 mt-0.5"
                        >
                          <span className="text-violet-400 text-sm font-mono">
                            devfolioapp.cloud/{portfolio.data?.slug}
                          </span>
                          <svg className="w-3 h-3 text-slate-600 group-hover:text-violet-400 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536M9 13l6.586-6.586a2 2 0 112.828 2.828L11.828 15.828a2 2 0 01-1.414.586H9v-2a2 2 0 01.586-1.414z" />
                          </svg>
                        </button>
                      )}
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
                    {portfolio.data?.sections?.length ?? 0} sections · v
                    {portfolio.data?.version ?? 1}
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

        {/* Resumes section */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-slate-100">My Resumes</h2>
              <p className="text-slate-500 text-sm mt-1">
                One per application — each exports to a print-perfect PDF.
              </p>
            </div>
            <Link
              href="/resume"
              className="text-sm text-slate-400 hover:text-violet-300 px-3 py-1.5 rounded-lg border border-slate-800 hover:border-violet-500/40 transition-colors"
            >
              View all →
            </Link>
          </div>

          {resumesLoading ? (
            <div className="text-slate-500 text-sm py-8 text-center">Loading…</div>
          ) : resumes.length === 0 ? (
            <Link
              href="/resume"
              className="block text-center py-12 border-2 border-dashed border-slate-800 hover:border-violet-500/40 rounded-2xl group transition-colors"
            >
              <div className="text-3xl mb-3 transition-transform group-hover:scale-110">📄</div>
              <h3 className="text-base font-semibold text-slate-300 group-hover:text-violet-200 mb-1 transition-colors">
                No resumes yet
              </h3>
              <p className="text-slate-500 text-xs">
                Click to create your first resume
              </p>
            </Link>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {resumes.slice(0, 6).map((r) => {
                const resumeTitle = r.data.metadata?.title ?? r.slug;
                const role = r.data.metadata?.targetRole;
                return (
                  <Link
                    key={r.id}
                    href={`/resume/${r.id}`}
                    className="group bg-slate-900 hover:bg-slate-900/70 border border-slate-800 hover:border-violet-500/40 rounded-2xl p-5 transition-all"
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-12 rounded-md bg-white/95 shadow-lg shadow-violet-500/10 shrink-0 flex flex-col gap-0.5 p-1.5">
                        <div className="h-1 w-3/4 rounded-full bg-slate-300" />
                        <div className="h-0.5 w-1/2 rounded-full bg-slate-300" />
                        <div className="mt-1 h-0.5 w-full rounded-full bg-slate-200" />
                        <div className="h-0.5 w-5/6 rounded-full bg-slate-200" />
                        <div className="h-0.5 w-4/6 rounded-full bg-slate-200" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-slate-100 truncate group-hover:text-violet-100 transition-colors">
                          {resumeTitle}
                        </h3>
                        <p className="text-xs text-slate-600 font-mono truncate mt-0.5">
                          {r.slug}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 mt-4 text-[11px] text-slate-500">
                      <span className="capitalize px-2 py-0.5 rounded-full bg-slate-800 text-slate-400">
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
                  className="flex flex-col items-center justify-center min-h-[120px] rounded-2xl border-2 border-dashed border-slate-800 hover:border-violet-500/40 text-slate-500 hover:text-violet-300 transition-colors"
                >
                  <span className="text-2xl mb-1">+</span>
                  <span className="text-xs font-medium">New resume</span>
                </Link>
              )}
            </div>
          )}
        </div>

        {/* GitHub section */}
        <div>
          <h2 className="text-xl font-bold text-slate-100 mb-1">GitHub</h2>
          <p className="text-slate-500 text-sm mb-4">
            Connect once here, then import repos inside the editor&apos;s{' '}
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
                  <p className="text-sm font-semibold text-slate-200">
                    Connect your GitHub account
                  </p>
                  <p className="text-xs text-slate-500 mt-1 max-w-sm">
                    Import your repositories as portfolio projects automatically — stars, language,
                    description included.
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
