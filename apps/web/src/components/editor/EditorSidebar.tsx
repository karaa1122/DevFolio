'use client';

import { useState } from 'react';
import { useEditorStore } from '@/store/editor.store';
import { SectionList } from './SectionList';
import { ThemePanel } from './ThemePanel';
import { SectionEditor } from './SectionEditor';
import { githubApi } from '@/lib/api';
import type { GitHubRepo } from '@devfolio/shared';
import useSWR from 'swr';

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';

interface Props {
  portfolioId: string;
}

type Tab = 'sections' | 'theme' | 'github' | 'settings';

export function EditorSidebar({ portfolioId }: Props) {
  const { activePanel, selectedSectionId, setActivePanel } = useEditorStore();

  const tabs: { id: Tab; label: string }[] = [
    { id: 'sections', label: 'Sections' },
    { id: 'theme', label: 'Theme' },
    { id: 'github', label: 'GitHub' },
    { id: 'settings', label: 'Settings' },
  ];

  return (
    <aside className="w-72 border-r border-slate-800 bg-slate-900 flex flex-col overflow-hidden shrink-0">
      {/* Tabs */}
      <div className="flex border-b border-slate-800 shrink-0 overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActivePanel(tab.id as any)}
            className={`flex-1 py-3 text-xs font-medium transition-colors whitespace-nowrap px-1 ${
              activePanel === tab.id
                ? 'text-violet-400 border-b-2 border-violet-400'
                : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Panel content */}
      <div className="flex-1 overflow-y-auto scrollbar-thin">
        {activePanel === 'sections' && (
          <>
            {selectedSectionId ? <SectionEditor sectionId={selectedSectionId} /> : <SectionList />}
          </>
        )}
        {activePanel === 'theme' && <ThemePanel />}
        {(activePanel as string) === 'github' && <GitHubPanel portfolioId={portfolioId} />}
        {activePanel === 'settings' && <SettingsPanel />}
      </div>
    </aside>
  );
}

// ─── GitHub Panel ──────────────────────────────────────────────────────────

function GitHubPanel({ portfolioId }: { portfolioId: string }) {
  const { data: status, mutate: mutateStatus } = useSWR('/github/status', githubApi.status, {
    revalidateOnFocus: false,
  });
  const { data: repos, isLoading: reposLoading } = useSWR<GitHubRepo[]>(
    status?.connected ? '/github/repos' : null,
    githubApi.repos,
    { revalidateOnFocus: false },
  );

  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [syncing, setSyncing] = useState(false);
  const [syncDone, setSyncDone] = useState(false);

  const toggleRepo = (id: number) => {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const handleSync = async () => {
    if (selected.size === 0) return;
    setSyncing(true);
    try {
      await githubApi.sync(portfolioId, Array.from(selected));
      setSelected(new Set());
      setSyncDone(true);
      setTimeout(() => setSyncDone(false), 3000);
    } catch (err) {
      console.error('Sync failed:', err);
    } finally {
      setSyncing(false);
    }
  };

  const handleDisconnect = async () => {
    await githubApi.disconnect();
    mutateStatus();
  };

  if (!status) {
    return (
      <div className="p-4 flex items-center justify-center h-24">
        <div className="w-4 h-4 border-2 border-slate-700 border-t-violet-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (!status.connected) {
    return (
      <div className="p-4 space-y-4">
        <h3 className="text-sm font-semibold text-slate-300">GitHub Integration</h3>
        <p className="text-xs text-slate-500 leading-relaxed">
          Connect your GitHub account to import repositories directly into your portfolio&apos;s projects
          section.
        </p>
        <a
          href={`${API_BASE}/api/v1/auth/github`}
          className="block w-full text-center bg-slate-800 hover:bg-slate-700 border border-slate-600 text-slate-200 text-sm font-medium py-2.5 rounded-lg transition-colors"
        >
          Connect GitHub
        </a>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-slate-300">GitHub Repos</h3>
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500">{status.username}</span>
          <button
            onClick={handleDisconnect}
            className="text-xs text-slate-600 hover:text-red-400 transition-colors"
            title="Disconnect GitHub"
          >
            ×
          </button>
        </div>
      </div>

      {syncDone && (
        <div className="bg-green-950/50 border border-green-800 text-green-400 text-xs px-3 py-2 rounded-lg">
          Repos imported into Projects section
        </div>
      )}

      {reposLoading ? (
        <div className="flex items-center justify-center h-20">
          <div className="w-4 h-4 border-2 border-slate-700 border-t-violet-500 rounded-full animate-spin" />
        </div>
      ) : (
        <>
          <p className="text-xs text-slate-500">Select repos to add to your Projects section:</p>
          <div className="space-y-1.5 max-h-72 overflow-y-auto">
            {(repos ?? []).map((repo) => (
              <label
                key={repo.id}
                className={`flex items-start gap-2.5 p-2.5 rounded-lg cursor-pointer transition-colors ${
                  selected.has(repo.id)
                    ? 'bg-violet-900/30 border border-violet-700/50'
                    : 'bg-slate-800 border border-transparent hover:border-slate-600'
                }`}
              >
                <input
                  type="checkbox"
                  checked={selected.has(repo.id)}
                  onChange={() => toggleRepo(repo.id)}
                  className="mt-0.5 accent-violet-500 shrink-0"
                />
                <div className="min-w-0">
                  <p className="text-xs font-medium text-slate-200 truncate">{repo.name}</p>
                  {repo.description && (
                    <p className="text-xs text-slate-500 truncate mt-0.5">{repo.description}</p>
                  )}
                  <div className="flex items-center gap-2 mt-1">
                    {repo.language && (
                      <span className="text-xs text-slate-600">{repo.language}</span>
                    )}
                    <span className="text-xs text-slate-600">★ {repo.stars}</span>
                  </div>
                </div>
              </label>
            ))}
          </div>

          <button
            onClick={handleSync}
            disabled={selected.size === 0 || syncing}
            className="w-full bg-violet-600 hover:bg-violet-500 disabled:opacity-40 text-white text-xs font-semibold py-2.5 rounded-lg transition-colors"
          >
            {syncing ? 'Importing...' : `Import ${selected.size > 0 ? selected.size : ''} Selected`}
          </button>
        </>
      )}
    </div>
  );
}

// ─── Settings Panel ────────────────────────────────────────────────────────

function SettingsPanel() {
  const { portfolio, updateMetadata } = useEditorStore();
  if (!portfolio) return null;

  return (
    <div className="p-4 space-y-4">
      <h3 className="text-sm font-semibold text-slate-300">Portfolio Settings</h3>

      <div>
        <label className="block text-xs text-slate-500 mb-1.5">Title</label>
        <input
          type="text"
          value={portfolio.metadata.title ?? ''}
          onChange={(e) => updateMetadata({ title: e.target.value })}
          className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-violet-500"
          placeholder="My Portfolio"
        />
      </div>

      <div>
        <label className="block text-xs text-slate-500 mb-1.5">SEO Description</label>
        <textarea
          value={portfolio.metadata.description ?? ''}
          onChange={(e) => updateMetadata({ description: e.target.value })}
          rows={3}
          className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-violet-500 resize-none"
          placeholder="A short description for search engines"
        />
      </div>

      <div>
        <label className="block text-xs text-slate-500 mb-1.5">Slug</label>
        <div className="flex items-center bg-slate-800 border border-slate-700 rounded-lg overflow-hidden">
          <span className="text-slate-500 text-xs pl-3">devfolioapp.cloud/</span>
          <span className="text-violet-400 text-sm py-2 pr-3 font-mono">{portfolio.slug}</span>
        </div>
        <p className="text-xs text-slate-600 mt-1">Slug cannot be changed after creation</p>
      </div>
    </div>
  );
}
