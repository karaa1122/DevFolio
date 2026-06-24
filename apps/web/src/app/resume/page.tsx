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

  const atLimit = (resumes?.length ?? 0) >= 1;

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
    <div className="relative min-h-screen overflow-x-clip bg-ink text-content">
      <div className="pointer-events-none fixed left-1/2 top-[-14rem] -z-10 h-[30rem] w-[40rem] -translate-x-1/2 rounded-full bg-accent/8 blur-[150px]" />
      <header className="sticky top-0 z-40 border-b border-line bg-ink/70 backdrop-blur-xl">
        <div className="mx-auto flex h-14 max-w-5xl items-center gap-3 px-6">
          <Link href="/dashboard" className="text-sm text-content-faint transition-colors hover:text-content">
            ← Dashboard
          </Link>
          <div className="ml-auto text-sm font-medium text-content-muted">Resumes</div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-6 py-10">
        <div className="mb-8 flex items-end justify-between">
          <div>
            <h1 className="font-display text-2xl font-bold tracking-tight text-content">
              Your resumes
            </h1>
            <p className="mt-1 text-sm text-content-faint">
              Tailor a separate resume per application. Each one exports to a print-perfect PDF.
            </p>
          </div>
          <div className="flex items-center gap-2">
            {atLimit && <span className="text-xs text-content-faint">1 resume max</span>}
            <button
              onClick={() => !atLimit && setShowForm((v) => !v)}
              disabled={atLimit}
              title={atLimit ? 'Free plan allows only 1 resume' : undefined}
              className="df-btn df-btn-primary px-4 py-2 text-sm"
            >
              {showForm ? 'Cancel' : '+ New resume'}
            </button>
          </div>
        </div>

        {showForm && (
          <div className="df-card mb-8 space-y-4 p-5">
            <div>
              <label className="mb-1.5 block text-xs text-content-faint">Slug</label>
              <input
                value={slug}
                onChange={(e) =>
                  setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-'))
                }
                placeholder="backend-engineer"
                className="df-input text-sm"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs text-content-faint">Title (optional)</label>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Backend Engineer — 2026"
                className="df-input text-sm"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs text-content-faint">Template</label>
              <div className="grid grid-cols-3 gap-2">
                {RESUME_TEMPLATE_IDS.map((t) => (
                  <button
                    key={t}
                    onClick={() => setTemplate(t)}
                    className={`rounded-lg border px-3 py-2 text-xs font-medium capitalize transition-colors ${
                      template === t
                        ? 'border-accent/60 bg-accent/15 text-accent'
                        : 'border-line bg-surface-2 text-content-muted hover:border-content-faint'
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
              className="df-btn df-btn-primary w-full py-2.5 text-sm"
            >
              {creating ? 'Creating...' : 'Create resume'}
            </button>
          </div>
        )}

        {isLoading ? (
          <div className="text-sm text-content-faint">Loading...</div>
        ) : resumes.length === 0 ? (
          <div className="rounded-xl border border-dashed border-line p-12 text-center">
            <p className="text-content-muted">No resumes yet.</p>
            <p className="mt-1 text-xs text-content-faint">Click &ldquo;New resume&rdquo; to get started.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {resumes.map((r) => {
              const title = r.data.metadata?.title ?? r.slug;
              const role = r.data.metadata?.targetRole;
              return (
                <div
                  key={r.id}
                  className="group flex items-center rounded-xl border border-line bg-surface px-5 py-4 transition-colors hover:border-accent/30 hover:bg-surface-2"
                >
                  <Link href={`/resume/${r.id}`} className="min-w-0 flex-1">
                    <div className="flex items-baseline gap-3">
                      <span className="truncate font-medium text-content">{title}</span>
                      <span className="font-mono text-xs text-content-faint">{r.slug}</span>
                    </div>
                    <div className="mt-1 flex items-center gap-3 text-xs text-content-faint">
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

                  <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                    {!atLimit && (
                      <button
                        onClick={() => handleDuplicate(r.id, r.slug)}
                        disabled={duplicatingId === r.id}
                        className="rounded px-2 py-1 text-xs text-content-faint transition-colors hover:text-content"
                        title="Duplicate"
                      >
                        Duplicate
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(r.id, title)}
                      className="rounded px-2 py-1 text-xs text-content-faint transition-colors hover:text-red-400"
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
