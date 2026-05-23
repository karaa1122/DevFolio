'use client';

import useSWR from 'swr';
import { useState } from 'react';
import { useResumeStore } from '@/store/resume.store';
import { githubApi, portfolioApi } from '@/lib/api';
import type { GitHubRepo, PortfolioResponse } from '@devfolio/shared';
import { makeProjectItem } from '../sectionDefaults';
import { generateId } from '@/lib/utils';

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';

interface Props {
  resumeId: string;
}

export function ImportPanel({ resumeId: _resumeId }: Props) {
  return (
    <div className="p-4 space-y-5">
      <div>
        <h3 className="text-sm font-semibold text-slate-200 mb-1">Import from GitHub</h3>
        <p className="text-xs text-slate-500 leading-relaxed mb-3">
          Pull selected repositories into your Projects section.
        </p>
        <GithubImport />
      </div>

      <div className="pt-4 border-t border-slate-800">
        <h3 className="text-sm font-semibold text-slate-200 mb-1">Pull from portfolio</h3>
        <p className="text-xs text-slate-500 leading-relaxed mb-3">
          Copy your hero + projects + experience into this resume. Useful when you&apos;ve already
          polished your portfolio.
        </p>
        <PortfolioPull />
      </div>
    </div>
  );
}

// ─── GitHub import ──────────────────────────────────────────────────────────

function GithubImport() {
  const { data: status, mutate: mutateStatus } = useSWR(
    '/github/status',
    githubApi.status,
    { revalidateOnFocus: false },
  );
  const { data: repos, isLoading } = useSWR<GitHubRepo[]>(
    status?.connected ? '/github/repos' : null,
    githubApi.repos,
    { revalidateOnFocus: false },
  );

  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [done, setDone] = useState(false);
  const { resume, addItemToSection, addSection } = useResumeStore();

  const toggle = (id: number) =>
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  const handleImport = () => {
    if (!resume || selected.size === 0) return;
    const repoList = (repos ?? []).filter((r) => selected.has(r.id));

    // Find or create a Projects section
    let projectsSection = resume.sections.find((s) => s.type === 'projects');
    if (!projectsSection) {
      addSection({
        id: generateId(),
        type: 'projects',
        visible: true,
        data: { heading: 'Projects', items: [] },
      });
      // re-read from updated store
      projectsSection = useResumeStore.getState().resume?.sections.find((s) => s.type === 'projects');
    }
    if (!projectsSection) return;

    for (const r of repoList) {
      addItemToSection(projectsSection.id, {
        ...makeProjectItem(),
        name: r.name,
        description: r.description ?? '',
        repoUrl: r.url,
        url: r.homepage ?? '',
        technologies: r.language ? [r.language, ...(r.topics ?? [])] : r.topics ?? [],
      });
    }

    setSelected(new Set());
    setDone(true);
    setTimeout(() => setDone(false), 2500);
  };

  if (!status) {
    return <div className="h-16 flex items-center justify-center text-slate-600 text-xs">Loading…</div>;
  }

  if (!status.connected) {
    return (
      <a
        href={`${API_BASE}/api/v1/auth/github`}
        className="block text-center bg-slate-800 hover:bg-slate-700 border border-slate-600 text-slate-200 text-sm font-medium py-2.5 rounded-lg transition-colors"
      >
        Connect GitHub
      </a>
    );
  }

  return (
    <div className="space-y-2">
      {done && (
        <div className="bg-green-950/40 border border-green-800 text-green-300 text-xs px-3 py-2 rounded-lg">
          Imported into Projects.
        </div>
      )}

      <div className="flex items-center justify-between text-xs text-slate-500">
        <span>@{status.username}</span>
        <button
          onClick={async () => {
            await githubApi.disconnect();
            mutateStatus();
          }}
          className="hover:text-red-400"
        >
          Disconnect
        </button>
      </div>

      {isLoading ? (
        <div className="h-16 flex items-center justify-center text-slate-600 text-xs">
          Loading repos…
        </div>
      ) : (
        <div className="space-y-1 max-h-72 overflow-y-auto">
          {(repos ?? []).map((repo) => (
            <label
              key={repo.id}
              className={`flex items-start gap-2 p-2 rounded-md cursor-pointer transition-colors text-xs ${
                selected.has(repo.id)
                  ? 'bg-violet-600/15 border border-violet-500/50'
                  : 'bg-slate-800/60 border border-transparent hover:border-slate-700'
              }`}
            >
              <input
                type="checkbox"
                checked={selected.has(repo.id)}
                onChange={() => toggle(repo.id)}
                className="mt-0.5 accent-violet-500 shrink-0"
              />
              <div className="min-w-0">
                <div className="font-medium text-slate-200 truncate">{repo.name}</div>
                {repo.description && (
                  <div className="text-slate-500 truncate mt-0.5">{repo.description}</div>
                )}
                <div className="flex items-center gap-2 mt-0.5 text-slate-600">
                  {repo.language && <span>{repo.language}</span>}
                  <span>★ {repo.stars}</span>
                </div>
              </div>
            </label>
          ))}
        </div>
      )}

      <button
        onClick={handleImport}
        disabled={selected.size === 0}
        className="w-full bg-violet-600 hover:bg-violet-500 disabled:opacity-40 text-white text-xs font-semibold py-2 rounded-lg transition-colors"
      >
        Import {selected.size > 0 ? selected.size : ''} into Projects
      </button>
    </div>
  );
}

// ─── Portfolio pull ─────────────────────────────────────────────────────────

function PortfolioPull() {
  const { data: portfolios } = useSWR<PortfolioResponse[]>(
    '/portfolios/mine',
    portfolioApi.list,
    { revalidateOnFocus: false },
  );
  const { resume, addItemToSection, addSection } = useResumeStore();
  const [pulling, setPulling] = useState(false);
  const [done, setDone] = useState(false);

  if (!portfolios || portfolios.length === 0) {
    return (
      <p className="text-xs text-slate-600 italic">
        No portfolios yet — create one in the Dashboard first.
      </p>
    );
  }

  const portfolio = portfolios[0];

  const handlePull = () => {
    if (!resume) return;
    setPulling(true);
    try {
      const p = portfolio.data;

      // Header from hero
      const hero = p.sections.find((s) => s.type === 'hero');
      if (hero) {
        const heroData = hero.data as { name: string; title: string; bio?: string };
        const existingHeader = resume.sections.find((s) => s.type === 'header');
        if (existingHeader) {
          useResumeStore.getState().updateSectionData(existingHeader.id, {
            name: heroData.name,
            title: heroData.title,
          });
        }
      }

      // Projects → projects
      const portfolioProjects = p.sections.find((s) => s.type === 'projects');
      if (portfolioProjects) {
        const projectData = portfolioProjects.data as { items: Array<{ title: string; description: string; tags: string[]; liveUrl?: string; repoUrl?: string; year?: number }> };
        let resumeProjects = resume.sections.find((s) => s.type === 'projects');
        if (!resumeProjects) {
          addSection({
            id: generateId(),
            type: 'projects',
            visible: true,
            data: { heading: 'Projects', items: [] },
          });
          resumeProjects = useResumeStore.getState().resume?.sections.find((s) => s.type === 'projects');
        }
        if (resumeProjects) {
          for (const item of projectData.items) {
            addItemToSection(resumeProjects.id, {
              ...makeProjectItem(),
              name: item.title,
              description: item.description,
              url: item.liveUrl,
              repoUrl: item.repoUrl,
              technologies: item.tags,
              year: item.year,
            });
          }
        }
      }

      setDone(true);
      setTimeout(() => setDone(false), 2500);
    } finally {
      setPulling(false);
    }
  };

  return (
    <div className="space-y-2">
      <div className="bg-slate-800/60 border border-slate-700 rounded-lg p-3 text-xs">
        <div className="text-slate-300 font-medium">{portfolio.data.metadata?.title ?? portfolio.slug}</div>
        <div className="text-slate-500 mt-0.5">{portfolio.data.sections.length} sections</div>
      </div>

      {done && (
        <div className="bg-green-950/40 border border-green-800 text-green-300 text-xs px-3 py-2 rounded-lg">
          Pulled name, title, and projects.
        </div>
      )}

      <button
        onClick={handlePull}
        disabled={pulling}
        className="w-full bg-slate-800 hover:bg-slate-700 disabled:opacity-40 border border-slate-700 text-slate-200 text-xs font-medium py-2 rounded-lg transition-colors"
      >
        {pulling ? 'Pulling…' : 'Pull from portfolio'}
      </button>
    </div>
  );
}
