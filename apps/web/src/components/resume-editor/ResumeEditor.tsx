'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { useResumeAutoSave } from '@/hooks/useResumeAutoSave';
import { useResumeStore } from '@/store/resume.store';
import { exportApi } from '@/lib/api';
import type { ExportJob } from '@devfolio/shared';
import { ResumeToolbar } from './Toolbar';
import { LeftPanel } from './LeftPanel/LeftPanel';
import { ResumeCanvas } from './RightPanel/ResumeCanvas';
import { ZoomControls } from './RightPanel/ZoomControls';
import { PageStrip } from './RightPanel/PageStrip';
import { ExportPanel } from './ExportPanel';
import { useResumeKeyboardShortcuts } from './useResumeKeyboardShortcuts';

interface Props {
  resumeId: string;
}

// ─── Export state machine ────────────────────────────────────────────────
// We model export as one of: closed | saving | queuing | polling | done | error.
// This replaces the previous boolean tangle (isLoading + nullable job) which
// could deadlock the UI in "Preparing…" forever when the API call failed.

type ExportState =
  | { phase: 'closed' }
  | { phase: 'saving' }
  | { phase: 'queuing' }
  | { phase: 'polling'; job: ExportJob }
  | { phase: 'done'; job: ExportJob }
  | { phase: 'error'; message: string; retry: boolean };

export function ResumeEditor({ resumeId }: Props) {
  const resume = useResumeStore((s) => s.resume);

  const [exportState, setExportState] = useState<ExportState>({ phase: 'closed' });
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Single source of truth for "save the resume now": flushNow is the same
  // function the debounced autosave uses, so Ctrl+S and pre-export saves can't
  // diverge from autosave behavior (error handling, save state, etc.).
  const { flushNow } = useResumeAutoSave(resumeId);
  useResumeKeyboardShortcuts({ onForceSave: flushNow });

  // Poll the export job while it's pending or processing.
  const pollingJobId = exportState.phase === 'polling' ? exportState.job.id : null;
  useEffect(() => {
    if (!pollingJobId) {
      if (pollRef.current) clearInterval(pollRef.current);
      return;
    }
    pollRef.current = setInterval(async () => {
      try {
        const updated = await exportApi.getStatus(pollingJobId);
        if (updated.status === 'completed') {
          setExportState({ phase: 'done', job: updated });
        } else if (updated.status === 'failed') {
          setExportState({
            phase: 'error',
            message: updated.errorMessage ?? 'Export worker reported failure.',
            retry: true,
          });
        } else {
          setExportState({ phase: 'polling', job: updated });
        }
      } catch (err) {
        setExportState({
          phase: 'error',
          message: err instanceof Error ? err.message : 'Lost connection to export service.',
          retry: true,
        });
      }
    }, 1200);
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [pollingJobId]);

  const handleExport = useCallback(async () => {
    if (!resume) return;
    setExportState({ phase: 'saving' });
    try {
      await flushNow();
      // If the flush errored, the store now has saveError set — bail out early
      // rather than queueing an export on stale data the worker can't read.
      const currentError = useResumeStore.getState().saveError;
      if (currentError) {
        setExportState({
          phase: 'error',
          message: `Couldn't save your latest changes: ${currentError}`,
          retry: true,
        });
        return;
      }
      setExportState({ phase: 'queuing' });
      const job = await exportApi.createResumePdf(resumeId);
      setExportState({ phase: 'polling', job });
    } catch (err) {
      console.error('[Export] failed to enqueue:', err);
      setExportState({
        phase: 'error',
        message:
          err instanceof Error
            ? err.message
            : 'Failed to start the export. Check that the export worker is running.',
        retry: true,
      });
    }
  }, [resume, resumeId, flushNow]);

  // Browser-print fallback so users always have a way to get a PDF, even if the
  // backend worker is down. Opens the OS print dialog on the current preview.
  const handleBrowserPrint = useCallback(() => {
    if (typeof window !== 'undefined') window.print();
  }, []);

  const closeExportPanel = useCallback(() => {
    setExportState({ phase: 'closed' });
  }, []);

  if (!resume) return null;

  const isExporting =
    exportState.phase === 'saving' ||
    exportState.phase === 'queuing' ||
    exportState.phase === 'polling';

  return (
    <div className="h-screen flex flex-col bg-slate-950 overflow-hidden">
      <ResumeToolbar onExport={handleExport} isExporting={isExporting} onForceSave={flushNow} />
      <div className="flex flex-1 overflow-hidden relative">
        <LeftPanel resumeId={resumeId} />
        <div className="flex-1 relative">
          <ResumeCanvas />
          <PageStrip />
          <ZoomControls />
          {exportState.phase !== 'closed' && (
            <ExportPanel
              state={exportState}
              onClose={closeExportPanel}
              onRetry={handleExport}
              onBrowserPrint={handleBrowserPrint}
            />
          )}
        </div>
      </div>
    </div>
  );
}
