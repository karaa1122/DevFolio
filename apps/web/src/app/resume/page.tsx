'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useResumeList } from '@/hooks/useResume';
import { resumeApi } from '@/lib/api';
import { RESUME_TEMPLATE_IDS, type ResumeTemplateId } from '@devfolio/shared';

export default function ResumesPage() {
  const router = useRouter();
  const { resumes, isLoading, mutate } = useResumeList();

  const [showForm, setShowForm] = useState(false);
  const [creating, setCreating] = useState(false);
  const [slug, setSlug] = useState('');
  const [title, setTitle] = useState('');
  const [template, setTemplate] = useState<ResumeTemplateId>('classic');
  const [error, setError] = useState('');
  const [duplicatingId, setDuplicatingId] = useState<string | null>(null);

  const handleCreate = async () => {
    if (!slug.trim()) return;
    setCreating(true);
    setError('');
    try {
      const r = await resumeApi.create({
        slug: slug.trim(),
        title: title.trim() || undefined,
        template,
      });
      await mutate();
      router.push(`/resume/${r.id}`);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to create resume');
    } finally {
      setCreating(false);
    }
  };

  const handleDuplicate = async (id: string, currentSlug: string) => {
    const newSlug = window.prompt('New slug for the copy:', `${currentSlug}-copy`);
    if (!newSlug) return;
    setDuplicatingId(id);
    try {
      const r = await resumeApi.duplicate(id, { slug: newSlug });
      await mutate();
      router.push(`/resume/${r.id}`);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Failed to duplicate');
    } finally {
      setDuplicatingId(null);
    }
  };

  const handleDelete = async (id: string, label: string) => {
    if (!window.confirm(`Delete "${label}"? This can't be undone.`)) return;
    await resumeApi.delete(id);
    mutate();
  };

  return (
    <div className="min-h-screen bg-slate-950">
      <header className="border-b border-slate-800 bg-slate-900/50 backdrop-blur sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-6 h-14 flex items-center gap-3">
          <Link href="/dashboard" className="text-slate-500 hover:text-slate-300 text-sm">
            ← Dashboard
          </Link>
          <div className="ml-auto text-slate-300 text-sm font-medium">Resumes</div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-10">
        <div className="flex items-end justify-between mb-8">
          <div>
            <h1 className="text-2xl font-semibold text-slate-100 tracking-tight">
              Your resumes
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Tailor a separate resume per application. Each one exports to a print-perfect PDF.
            </p>
          </div>
          <button
            onClick={() => setShowForm((v) => !v)}
            className="bg-violet-600 hover:bg-violet-500 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
          >
            {showForm ? 'Cancel' : '+ New resume'}
          </button>
        </div>

        {showForm && (
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 mb-8 space-y-4">
            <div>
              <label className="block text-xs text-slate-500 mb-1.5">Slug</label>
              <input
                value={slug}
                onChange={(e) =>
                  setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-'))
                }
                placeholder="backend-engineer"
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-violet-500"
              />
            </div>
            <div>
              <label className="block text-xs text-slate-500 mb-1.5">Title (optional)</label>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Backend Engineer — 2026"
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-violet-500"
              />
            </div>
            <div>
              <label className="block text-xs text-slate-500 mb-1.5">Template</label>
              <div className="grid grid-cols-3 gap-2">
                {RESUME_TEMPLATE_IDS.map((t) => (
                  <button
                    key={t}
                    onClick={() => setTemplate(t)}
                    className={`px-3 py-2 rounded-lg text-xs font-medium capitalize border transition-colors ${
                      template === t
                        ? 'bg-violet-600/20 border-violet-500 text-violet-200'
                        : 'bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-600'
                    }`}
                  >
                    {t.replace('-', ' ')}
                  </button>
                ))}
              </div>
            </div>

            {error && <p className="text-xs text-red-400">{error}</p>}

            <button
              onClick={handleCreate}
              disabled={creating || !slug.trim()}
              className="w-full bg-violet-600 hover:bg-violet-500 disabled:opacity-40 text-white text-sm font-semibold py-2.5 rounded-lg transition-colors"
            >
              {creating ? 'Creating...' : 'Create resume'}
            </button>
          </div>
        )}

        {isLoading ? (
          <div className="text-slate-500 text-sm">Loading...</div>
        ) : resumes.length === 0 ? (
          <div className="border border-dashed border-slate-800 rounded-xl p-12 text-center">
            <p className="text-slate-400">No resumes yet.</p>
            <p className="text-slate-600 text-xs mt-1">Click &ldquo;New resume&rdquo; to get started.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {resumes.map((r) => {
              const title = r.data.metadata?.title ?? r.slug;
              const role = r.data.metadata?.targetRole;
              return (
                <div
                  key={r.id}
                  className="group flex items-center bg-slate-900 hover:bg-slate-800/70 border border-slate-800 hover:border-slate-700 rounded-xl px-5 py-4 transition-colors"
                >
                  <Link href={`/resume/${r.id}`} className="flex-1 min-w-0">
                    <div className="flex items-baseline gap-3">
                      <span className="text-slate-100 font-medium truncate">{title}</span>
                      <span className="text-xs text-slate-600 font-mono">{r.slug}</span>
                    </div>
                    <div className="flex items-center gap-3 mt-1 text-xs text-slate-500">
                      <span className="capitalize">{r.data.template}</span>
                      <span>·</span>
                      <span>{r.data.sections.length} sections</span>
                      {role && (
                        <>
                          <span>·</span>
                          <span>{role}</span>
                        </>
                      )}
                      <span>·</span>
                      <span>updated {new Date(r.updatedAt).toLocaleDateString()}</span>
                    </div>
                  </Link>

                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => handleDuplicate(r.id, r.slug)}
                      disabled={duplicatingId === r.id}
                      className="text-xs text-slate-500 hover:text-slate-200 px-2 py-1 rounded transition-colors"
                      title="Duplicate"
                    >
                      Duplicate
                    </button>
                    <button
                      onClick={() => handleDelete(r.id, title)}
                      className="text-xs text-slate-500 hover:text-red-400 px-2 py-1 rounded transition-colors"
                      title="Delete"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
