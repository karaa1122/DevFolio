'use client';

import { useState, useEffect, useRef } from 'react';
import { useEditorStore, useEditorHistory } from '@/store/editor.store';
import { useEditorAutoSave } from '@/hooks/useEditorAutoSave';
import { EditorSidebar } from './EditorSidebar';
import { EditorCanvas } from './EditorCanvas';
import { portfolioApi, exportApi } from '@/lib/api';
import type { ExportJob } from '@devfolio/shared';
import Link from 'next/link';

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';

interface Props {
  portfolioId: string;
  isPublished: boolean;
  onPublishChange: () => void;
}

export function Editor({ portfolioId, isPublished, onPublishChange }: Props) {
  const { portfolio, mode, isDirty, isSaving, setMode, markClean, setIsSaving } = useEditorStore();
  const { undo, redo, pastStates, futureStates } = useEditorHistory();

  const [published, setPublished] = useState(isPublished);
  const [exportJob, setExportJob] = useState<ExportJob | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [showExportPanel, setShowExportPanel] = useState(false);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    setPublished(isPublished);
  }, [isPublished]);

  useEditorAutoSave();

  // Poll export job until done
  useEffect(() => {
    if (!exportJob || exportJob.status === 'completed' || exportJob.status === 'failed') {
      if (pollRef.current) clearInterval(pollRef.current);
      return;
    }
    pollRef.current = setInterval(async () => {
      try {
        const updated = await exportApi.getStatus(exportJob.id);
        setExportJob(updated);
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
    if (!portfolio || !isDirty) return;
    setIsSaving(true);
    try {
      await portfolioApi.update(portfolioId, portfolio);
      markClean();
    } finally {
      setIsSaving(false);
    }
  };

  const handlePublishToggle = async () => {
    try {
      if (published) {
        await portfolioApi.unpublish(portfolioId);
        setPublished(false);
      } else {
        await portfolioApi.publish(portfolioId);
        setPublished(true);
      }
      onPublishChange();
    } catch (err) {
      console.error('Publish toggle failed:', err);
    }
  };

  const handleExport = async () => {
    setIsExporting(true);
    setShowExportPanel(true);
    try {
      const job = await exportApi.create(portfolioId);
      setExportJob(job);
    } catch (err) {
      console.error('Export failed:', err);
    } finally {
      setIsExporting(false);
    }
  };

  if (!portfolio) return null;

  const exportInProgress = exportJob?.status === 'pending' || exportJob?.status === 'processing';

  return (
    <div className="h-screen flex flex-col bg-slate-950 overflow-hidden">
      {/* Toolbar */}
      <header className="h-14 border-b border-slate-800 bg-slate-900 flex items-center px-4 gap-3 shrink-0 z-50">
        <Link href="/dashboard" className="text-slate-500 hover:text-slate-300 transition-colors">
          ←
        </Link>

        <div className="font-mono text-sm text-violet-400 truncate max-w-[180px]">
          {portfolio.slug}
        </div>

        {/* Undo / Redo */}
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

        {/* Mode toggle */}
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

        {/* Save indicator */}
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

        {/* Export */}
        <div className="relative">
          <button
            onClick={exportInProgress ? () => setShowExportPanel(true) : handleExport}
            disabled={isExporting}
            className="bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-300 text-xs font-medium px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5"
          >
            {exportInProgress ? (
              <span className="w-3 h-3 border border-slate-500 border-t-violet-400 rounded-full animate-spin" />
            ) : (
              '↓'
            )}
            Export
          </button>

          {showExportPanel && exportJob && (
            <div className="absolute right-0 top-full mt-2 w-72 bg-slate-800 border border-slate-700 rounded-xl shadow-2xl p-4 z-50">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-semibold text-slate-200">Export ZIP</span>
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
                    Building your portfolio...
                  </div>
                  <div className="w-full bg-slate-700 rounded-full h-1.5">
                    <div className="bg-violet-500 h-1.5 rounded-full animate-pulse w-2/3" />
                  </div>
                </div>
              ) : exportJob.status === 'completed' && exportJob.fileUrl ? (
                <div className="space-y-3">
                  <p className="text-sm text-green-400">Export ready!</p>
                  <a
                    href={`${API_BASE}${exportJob.fileUrl}`}
                    download
                    className="block w-full text-center bg-violet-600 hover:bg-violet-500 text-white text-sm font-semibold py-2 rounded-lg transition-colors"
                  >
                    Download ZIP
                  </a>
                  <p className="text-xs text-slate-500">
                    Contains index.html, styles.css — host anywhere
                  </p>
                  <button
                    onClick={() => {
                      setExportJob(null);
                      setShowExportPanel(false);
                    }}
                    className="w-full text-xs text-slate-600 hover:text-slate-400 transition-colors"
                  >
                    Dismiss
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  <p className="text-sm text-red-400">Export failed</p>
                  <p className="text-xs text-slate-500">
                    {exportJob.errorMessage ?? 'Unknown error'}
                  </p>
                  <button
                    onClick={() => {
                      setExportJob(null);
                      handleExport();
                    }}
                    className="w-full text-xs bg-slate-700 hover:bg-slate-600 text-slate-300 py-1.5 rounded-lg transition-colors"
                  >
                    Retry
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Publish / Unpublish */}
        <button
          onClick={handlePublishToggle}
          className={`text-xs font-semibold px-4 py-1.5 rounded-lg transition-colors ${
            published
              ? 'bg-green-900/60 hover:bg-red-900/60 text-green-400 hover:text-red-400 border border-green-800/50 hover:border-red-800/50'
              : 'bg-violet-600 hover:bg-violet-500 text-white'
          }`}
          title={published ? 'Click to unpublish' : 'Publish'}
        >
          {published ? 'Published ✓' : 'Publish'}
        </button>

        <Link
          href="/profile"
          className="text-xs text-slate-500 hover:text-slate-300 border border-slate-700 hover:border-slate-600 px-2.5 py-1.5 rounded-lg transition-colors"
          title="Profile"
        >
          ⚙
        </Link>
      </header>

      {/* Body */}
      <div className="flex flex-1 overflow-hidden">
        {mode === 'edit' && <EditorSidebar portfolioId={portfolioId} />}
        <EditorCanvas mode={mode} />
      </div>
    </div>
  );
}
