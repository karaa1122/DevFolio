'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useResumeStore, useResumeHistory } from '@/store/resume.store';
import { useResumeAutoSave } from '@/hooks/useResumeAutoSave';
import { resumeApi } from '@/lib/api';
import { ResumeSidebar } from './ResumeSidebar';
import { ResumePreview } from './ResumePreview';
import type { ExportJob } from '@devfolio/shared';

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';

interface Props {
  resumeId: string;
}

export function ResumeEditor({ resumeId }: Props) {
  const { resume, mode, isDirty, isSaving, setMode, markClean, setIsSaving } = useResumeStore();
  const { undo, redo, pastStates, futureStates } = useResumeHistory();

  const [exportJob, setExportJob] = useState<ExportJob | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [showExportPanel, setShowExportPanel] = useState(false);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useResumeAutoSave(resumeId);

  useEffect(() => {
    if (!exportJob || exportJob.status === 'completed' || exportJob.status === 'failed') {
      if (pollRef.current) clearInterval(pollRef.current);
      return;
    }
    pollRef.current = setInterval(async () => {
      try {
        const updated = await resumeApi.listExports(resumeId);
        const matching = updated.find((j) => j.id === exportJob.id);
        if (matching) setExportJob(matching);
      } catch {
        if (pollRef.current) clearInterval(pollRef.current);
      }
    }, 2000);
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [exportJob?.id, exportJob?.status]);

  const handleManualSave = async () => {
    if (!resume || !isDirty) return;
    setIsSaving(true);
    try {
      await resumeApi.update(resumeId, resume);
      markClean();
    } finally {
      setIsSaving(false);
    }
  };

  const handleExport = async () => {
    setIsExporting(true);
    setShowExportPanel(true);
    try {
      const job = await resumeApi.export(resumeId);
      setExportJob(job);
    } catch (err) {
      console.error('Resume export failed:', err);
    } finally {
      setIsExporting(false);
    }
  };

  if (!resume) return null;

  const exportInProgress = exportJob?.status === 'pending' || exportJob?.status === 'processing';

  return (
    <div className="h-screen flex flex-col bg-slate-950 overflow-hidden">
      {/* Toolbar */}
      <header className="h-14 border-b border-slate-800 bg-slate-900 flex items-center px-4 gap-3 shrink-0 z-50">
        <Link href="/dashboard" className="text-slate-500 hover:text-slate-300 transition-colors">
          ←
        </Link>

        <div className="font-mono text-sm text-violet-400 truncate max-w-[180px]">
          {resume.title ?? 'Resume'}
        </div>

        <div className="flex gap-1">
          <button
            onClick={() => undo()}
            disabled={pastStates.length === 0}
            title="Undo"
            className="p-1.5 rounded text-slate-500 hover:text-slate-300 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            ↩
          </button>
          <button
            onClick={() => redo()}
            disabled={futureStates.length === 0}
            title="Redo"
            className="p-1.5 rounded text-slate-500 hover:text-slate-300 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            ↪
          </button>
        </div>

        <div className="flex bg-slate-800 rounded-lg p-0.5 ml-auto">
          {(['edit', 'preview'] as const).map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium capitalize transition-colors ${
                mode === m ? 'bg-slate-700 text-slate-100' : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              {m}
            </button>
          ))}
        </div>

        <span className="text-xs text-slate-600 hidden sm:block">
          {isSaving ? 'Saving...' : isDirty ? 'Unsaved' : 'Saved'}
        </span>

        <button
          onClick={handleManualSave}
          disabled={!isDirty || isSaving}
          className="bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-300 text-xs font-medium px-3 py-1.5 rounded-lg transition-colors"
        >
          Save
        </button>

        {/* PDF Export */}
        <div className="relative">
          <button
            onClick={exportInProgress ? () => setShowExportPanel(true) : handleExport}
            disabled={isExporting}
            className="bg-violet-700 hover:bg-violet-600 disabled:opacity-40 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5"
          >
            {exportInProgress ? (
              <span className="w-3 h-3 border border-violet-400 border-t-white rounded-full animate-spin" />
            ) : (
              '↓'
            )}
            Export PDF
          </button>

          {showExportPanel && exportJob && (
            <div className="absolute right-0 top-full mt-2 w-72 bg-slate-800 border border-slate-700 rounded-xl shadow-2xl p-4 z-50">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-semibold text-slate-200">Export PDF</span>
                <button
                  onClick={() => setShowExportPanel(false)}
                  className="text-slate-500 hover:text-slate-300 text-lg leading-none"
                >
                  ×
                </button>
              </div>

              {exportJob.status === 'pending' || exportJob.status === 'processing' ? (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-slate-400 text-sm">
                    <span className="w-4 h-4 border-2 border-slate-600 border-t-violet-400 rounded-full animate-spin shrink-0" />
                    Generating your PDF...
                  </div>
                  <div className="w-full bg-slate-700 rounded-full h-1.5">
                    <div className="bg-violet-500 h-1.5 rounded-full animate-pulse w-2/3" />
                  </div>
                </div>
              ) : exportJob.status === 'completed' && exportJob.fileUrl ? (
                <div className="space-y-3">
                  <p className="text-sm text-green-400">PDF ready!</p>
                  <a
                    href={`${API_BASE}${exportJob.fileUrl}`}
                    download
                    target="_blank"
                    rel="noreferrer"
                    className="block w-full text-center bg-violet-600 hover:bg-violet-500 text-white text-sm font-semibold py-2 rounded-lg transition-colors"
                  >
                    Download PDF
                  </a>
                  <button
                    onClick={() => { setExportJob(null); setShowExportPanel(false); }}
                    className="w-full text-xs text-slate-600 hover:text-slate-400 transition-colors"
                  >
                    Dismiss
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  <p className="text-sm text-red-400">Export failed</p>
                  <p className="text-xs text-slate-500">{exportJob.errorMessage ?? 'Unknown error'}</p>
                  <button
                    onClick={() => { setExportJob(null); handleExport(); }}
                    className="w-full text-xs bg-slate-700 hover:bg-slate-600 text-slate-300 py-1.5 rounded-lg transition-colors"
                  >
                    Retry
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </header>

      {/* Body */}
      <div className="flex flex-1 overflow-hidden">
        {mode === 'edit' && <ResumeSidebar resumeId={resumeId} />}
        <ResumePreview />
      </div>
    </div>
  );
}
