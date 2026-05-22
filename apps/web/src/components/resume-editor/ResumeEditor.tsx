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
  const { resume, isDirty, isSaving, markClean, setIsSaving } = useResumeStore();
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
    <div className="h-screen flex flex-col bg-white overflow-hidden">
      {/* Toolbar */}
      <header className="h-12 border-b border-slate-200 bg-white flex items-center px-4 gap-3 shrink-0 z-50">
        <Link
          href="/dashboard"
          className="flex items-center gap-1.5 text-slate-500 hover:text-slate-800 transition-colors text-sm"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          <span className="hidden sm:inline">Dashboard</span>
        </Link>

        <div className="w-px h-5 bg-slate-200" />

        <span className="text-sm font-semibold text-slate-800 truncate max-w-[200px]">
          {resume.title ?? 'Resume'}
        </span>

        {/* Undo / Redo */}
        <div className="flex gap-0.5 ml-1">
          <button
            onClick={() => undo()}
            disabled={pastStates.length === 0}
            title="Undo (Ctrl+Z)"
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h10a8 8 0 018 8v2M3 10l6 6M3 10l6-6" />
            </svg>
          </button>
          <button
            onClick={() => redo()}
            disabled={futureStates.length === 0}
            title="Redo (Ctrl+Y)"
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 10H11a8 8 0 00-8 8v2M21 10l-6 6M21 10l-6-6" />
            </svg>
          </button>
        </div>

        {/* Right side */}
        <div className="ml-auto flex items-center gap-2">
          <span className="text-xs text-slate-400 hidden sm:block select-none">
            {isSaving ? 'Saving…' : isDirty ? '● Unsaved' : '✓ Saved'}
          </span>

          <button
            onClick={handleManualSave}
            disabled={!isDirty || isSaving}
            className="text-xs font-medium px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-slate-300 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
          >
            Save
          </button>

          {/* PDF Export */}
          <div className="relative">
            <button
              onClick={exportInProgress ? () => setShowExportPanel(true) : handleExport}
              disabled={isExporting}
              className="flex items-center gap-1.5 bg-violet-600 hover:bg-violet-700 disabled:opacity-50 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors"
            >
              {exportInProgress ? (
                <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
              )}
              Download PDF
            </button>

            {/* Export dropdown */}
            {showExportPanel && exportJob && (
              <div className="absolute right-0 top-full mt-2 w-72 bg-white border border-slate-200 rounded-xl shadow-2xl p-4 z-50">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-semibold text-slate-800">Export PDF</span>
                  <button
                    onClick={() => setShowExportPanel(false)}
                    className="text-slate-400 hover:text-slate-700 transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                {exportJob.status === 'pending' || exportJob.status === 'processing' ? (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2.5 text-slate-600 text-sm">
                      <span className="w-4 h-4 border-2 border-slate-300 border-t-violet-600 rounded-full animate-spin shrink-0" />
                      Generating your PDF…
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-1">
                      <div className="bg-violet-500 h-1 rounded-full animate-pulse w-2/3" />
                    </div>
                    <p className="text-xs text-slate-400">This usually takes 5–15 seconds</p>
                  </div>
                ) : exportJob.status === 'completed' && exportJob.fileUrl ? (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-emerald-600 text-sm font-medium">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                      PDF ready!
                    </div>
                    <a
                      href={`${API_BASE}${exportJob.fileUrl}`}
                      download
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center justify-center gap-2 w-full bg-violet-600 hover:bg-violet-700 text-white text-sm font-semibold py-2 rounded-lg transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                      </svg>
                      Download PDF
                    </a>
                    <button
                      onClick={() => { setExportJob(null); setShowExportPanel(false); }}
                      className="w-full text-xs text-slate-400 hover:text-slate-600 transition-colors"
                    >
                      Dismiss
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-red-500 text-sm font-medium">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Export failed
                    </div>
                    <p className="text-xs text-slate-500">{exportJob.errorMessage ?? 'Unknown error occurred'}</p>
                    <button
                      onClick={() => { setExportJob(null); handleExport(); }}
                      className="w-full text-sm bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium py-1.5 rounded-lg transition-colors"
                    >
                      Try again
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Split-screen body — always visible */}
      <div className="flex flex-1 overflow-hidden">
        <ResumeSidebar resumeId={resumeId} />
        <ResumePreview />
      </div>
    </div>
  );
}
