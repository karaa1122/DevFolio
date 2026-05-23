'use client';

import { useState } from 'react';
import { useResumeStore } from '@/store/resume.store';
import { resumeApi } from '@/lib/api';

interface Props {
  resumeId: string;
}

export function SettingsPanel({ resumeId }: Props) {
  const { resume, updateMetadata } = useResumeStore();
  const setResume = useResumeStore((s) => s.setResume);
  const [slugDraft, setSlugDraft] = useState<string>('');
  const [editingSlug, setEditingSlug] = useState(false);
  const [slugSaving, setSlugSaving] = useState(false);
  const [slugError, setSlugError] = useState('');

  if (!resume) return null;

  const saveSlug = async () => {
    if (!slugDraft.trim() || slugDraft === resume.slug) {
      setEditingSlug(false);
      return;
    }
    setSlugSaving(true);
    setSlugError('');
    try {
      const updated = await resumeApi.updateSlug(resumeId, slugDraft.trim());
      setResume(updated.data);
      setEditingSlug(false);
    } catch (err: unknown) {
      setSlugError(err instanceof Error ? err.message : 'Failed to update slug');
    } finally {
      setSlugSaving(false);
    }
  };

  return (
    <div className="p-4 space-y-4">
      <Field label="Title">
        <input
          type="text"
          value={resume.metadata.title ?? ''}
          onChange={(e) => updateMetadata({ title: e.target.value })}
          placeholder="Backend Engineer — 2026"
          className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-violet-500"
        />
      </Field>

      <Field label="Target role">
        <input
          type="text"
          value={resume.metadata.targetRole ?? ''}
          onChange={(e) => updateMetadata({ targetRole: e.target.value })}
          placeholder="Senior Backend Engineer"
          className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-violet-500"
        />
      </Field>

      <Field label="Filename (for downloaded PDF)">
        <input
          type="text"
          value={resume.metadata.fileName ?? ''}
          onChange={(e) => updateMetadata({ fileName: e.target.value })}
          placeholder="karaa-kamaran-backend.pdf"
          className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-violet-500"
        />
      </Field>

      <Field label="Notes (private)">
        <textarea
          rows={4}
          value={resume.metadata.notes ?? ''}
          onChange={(e) => updateMetadata({ notes: e.target.value })}
          placeholder="Tailoring notes for this version"
          className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-violet-500 resize-none"
        />
      </Field>

      <Field label="Slug">
        {editingSlug ? (
          <div className="space-y-2">
            <input
              type="text"
              value={slugDraft}
              onChange={(e) => setSlugDraft(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-'))}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 font-mono focus:outline-none focus:border-violet-500"
            />
            {slugError && <p className="text-xs text-red-400">{slugError}</p>}
            <div className="flex gap-2">
              <button
                onClick={saveSlug}
                disabled={slugSaving}
                className="flex-1 bg-violet-600 hover:bg-violet-500 disabled:opacity-40 text-white text-xs font-semibold py-1.5 rounded transition-colors"
              >
                {slugSaving ? 'Saving…' : 'Save slug'}
              </button>
              <button
                onClick={() => setEditingSlug(false)}
                className="px-3 text-slate-500 hover:text-slate-200 text-xs"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => {
              setSlugDraft(resume.slug);
              setEditingSlug(true);
            }}
            className="w-full text-left bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 font-mono hover:border-slate-600 transition-colors"
          >
            {resume.slug}
            <span className="ml-2 text-xs text-slate-500">edit</span>
          </button>
        )}
      </Field>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-[11px] uppercase tracking-wider text-slate-500 mb-1.5 font-semibold">
        {label}
      </label>
      {children}
    </div>
  );
}
