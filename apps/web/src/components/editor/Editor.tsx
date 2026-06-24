'use client';

import { useState, useEffect, useRef } from 'react';
import { useEditorStore, useEditorHistory } from '@/store/editor.store';
import { useEditorAutoSave } from '@/hooks/useEditorAutoSave';
import { EditorSidebar } from './EditorSidebar';
import { EditorCanvas } from './EditorCanvas';
import { portfolioApi, exportApi } from '@/lib/api';
import type { ExportJob } from '@devfolio/shared';
import Link from 'next/link';
import {
  IconArrowLeft,
  IconArrowRight,
  IconDownload,
  IconRedo,
  IconSettings,
  IconUndo,
} from '@/components/icons';

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
    <div className="flex h-screen flex-col overflow-hidden bg-ink">
      {/* Toolbar */}
      <header className="z-50 flex h-14 shrink-0 items-center gap-3 border-b border-line bg-ink/95 px-4 backdrop-blur-xl">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1.5 rounded-lg border border-line px-2.5 py-1.5 text-xs font-medium text-content-muted transition-colors hover:border-accent/40 hover:text-content"
          title="Back to dashboard"
        >
          <IconArrowLeft className="h-3.5 w-3.5" />
          Dashboard
        </Link>

        <div className="ml-1 flex items-center gap-2">
          <span className="h-1.5 w-1.5 rounded-full bg-accent shadow-[0_0_8px_rgb(var(--accent))]" />
          <span className="max-w-[180px] truncate font-mono text-sm text-content-muted">
            {portfolio.slug}
          </span>
        </div>

        {/* Undo / Redo */}
        <div className="flex gap-0.5">
          <button
            onClick={() => undo()}
            disabled={pastStates.length === 0}
            title="Undo"
            className="grid h-7 w-7 place-items-center rounded-md text-content-faint transition-colors hover:bg-surface-2 hover:text-content disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:bg-transparent"
          >
            <IconUndo className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={() => redo()}
            disabled={futureStates.length === 0}
            title="Redo"
            className="grid h-7 w-7 place-items-center rounded-md text-content-faint transition-colors hover:bg-surface-2 hover:text-content disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:bg-transparent"
          >
            <IconRedo className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* Mode toggle */}
        <div className="ml-auto flex rounded-lg border border-line bg-surface p-0.5">
          {(['edit', 'preview'] as const).map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={`rounded-md px-3 py-1.5 text-xs font-medium capitalize transition-colors ${
                mode === m ? 'bg-surface-3 text-content' : 'text-content-faint hover:text-content'
              }`}
            >
              {m}
            </button>
          ))}
        </div>

        {/* Save indicator */}
        <span className="hidden text-xs text-content-faint sm:block">
          {isSaving ? 'Saving...' : isDirty ? 'Unsaved' : 'Saved'}
        </span>

        <button
          onClick={handleManualSave}
          disabled={!isDirty || isSaving}
          className="df-btn df-btn-ghost px-3 py-1.5 text-xs"
        >
          Save
        </button>

        {/* Export */}
        <div className="relative">
          <button
            onClick={exportInProgress ? () => setShowExportPanel(true) : handleExport}
            disabled={isExporting}
            className="df-btn df-btn-ghost px-3 py-1.5 text-xs"
          >
            {exportInProgress ? (
              <span className="h-3 w-3 animate-spin rounded-full border border-content-faint border-t-accent" />
            ) : (
              <IconDownload className="h-3.5 w-3.5" />
            )}
            Export
          </button>

          {showExportPanel && exportJob && (
            <div className="df-card absolute right-0 top-full z-50 mt-2 w-72 p-4 shadow-2xl">
              <div className="mb-3 flex items-center justify-between">
                <span className="text-sm font-semibold text-content">Export ZIP</span>
                <button
                  onClick={() => setShowExportPanel(false)}
                  className="text-lg leading-none text-content-faint transition-colors hover:text-content"
                >
                  ×
                </button>
              </div>

              {exportJob.status === 'pending' || exportJob.status === 'processing' ? (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-content-muted">
                    <span className="h-4 w-4 shrink-0 animate-spin rounded-full border-2 border-surface-3 border-t-accent" />
                    Building your portfolio...
                  </div>
                  <div className="h-1.5 w-full rounded-full bg-surface-3">
                    <div className="h-1.5 w-2/3 animate-pulse rounded-full bg-accent" />
                  </div>
                </div>
              ) : exportJob.status === 'completed' && exportJob.fileUrl ? (
                <div className="space-y-3">
                  <p className="text-sm text-accent">Export ready!</p>
                  <a
                    href={`${API_BASE}${exportJob.fileUrl}`}
                    download
                    className="df-btn df-btn-primary w-full py-2 text-sm"
                  >
                    Download ZIP
                  </a>
                  <p className="text-xs text-content-faint">
                    Contains index.html, styles.css — host anywhere
                  </p>
                  <button
                    onClick={() => {
                      setExportJob(null);
                      setShowExportPanel(false);
                    }}
                    className="w-full text-xs text-content-faint transition-colors hover:text-content"
                  >
                    Dismiss
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  <p className="text-sm text-red-400">Export failed</p>
                  <p className="text-xs text-content-faint">
                    {exportJob.errorMessage ?? 'Unknown error'}
                  </p>
                  <button
                    onClick={() => {
                      setExportJob(null);
                      handleExport();
                    }}
                    className="df-btn df-btn-ghost w-full py-1.5 text-xs"
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
          className={
            published
              ? 'df-btn group border border-accent/40 bg-accent/10 px-4 py-1.5 text-xs text-accent transition-colors hover:border-red-500/40 hover:bg-red-500/10 hover:text-red-400'
              : 'df-btn df-btn-primary px-4 py-1.5 text-xs'
          }
          title={published ? 'Click to unpublish' : 'Publish'}
        >
          {published ? (
            <>
              <span className="group-hover:hidden">Published ✓</span>
              <span className="hidden group-hover:inline">Unpublish</span>
            </>
          ) : (
            <>
              Publish
              <IconArrowRight className="h-3.5 w-3.5" />
            </>
          )}
        </button>

        <Link
          href="/profile"
          className="grid h-8 w-8 place-items-center rounded-lg border border-line text-content-faint transition-colors hover:border-content-faint hover:text-content"
          title="Profile"
        >
          <IconSettings className="h-4 w-4" />
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
