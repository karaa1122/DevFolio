'use client';

import Link from 'next/link';
import { useResumeStore, useResumeHistory } from '@/store/resume.store';
import { ShortcutHelp } from './ShortcutHelp';

interface Props {
  onExport: () => void;
  onForceSave: () => void | Promise<void>;
  isExporting: boolean;
}

export function ResumeToolbar({ onExport, onForceSave, isExporting }: Props) {
  const { resume, isDirty, isSaving, saveError } = useResumeStore();
  const { undo, redo, pastStates, futureStates } = useResumeHistory();

  if (!resume) return null;

  return (
    <header className="h-14 border-b border-slate-800/70 bg-slate-950/95 backdrop-blur-xl flex items-center px-4 gap-2 shrink-0 z-30">
      <Link
        href="/resume"
        className="text-slate-500 hover:text-slate-200 text-sm w-8 h-8 rounded-md grid place-items-center hover:bg-slate-800/60 transition-colors"
        title="Back to resumes"
      >
        ←
      </Link>

      <div className="flex items-center gap-2 min-w-0">
        <div className="w-1.5 h-1.5 rounded-full bg-violet-400 shadow-[0_0_8px_rgba(167,139,250,0.6)]" />
        <span className="font-mono text-[13px] text-slate-200 truncate max-w-[200px]">
          {resume.slug}
        </span>
      </div>

      <div className="w-px h-5 bg-slate-800 mx-1.5" />

      <div className="flex items-center gap-0.5">
        <ToolButton
          onClick={() => undo()}
          disabled={pastStates.length === 0}
          title="Undo (Ctrl+Z)"
          ariaLabel="Undo"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 7v6h6" />
            <path d="M21 17a9 9 0 0 0-15-6.7L3 13" />
          </svg>
        </ToolButton>
        <ToolButton
          onClick={() => redo()}
          disabled={futureStates.length === 0}
          title="Redo (Ctrl+Shift+Z)"
          ariaLabel="Redo"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 7v6h-6" />
            <path d="M3 17a9 9 0 0 1 15-6.7L21 13" />
          </svg>
        </ToolButton>
      </div>

      <div className="ml-auto flex items-center gap-3">
        <SaveStatus
          isSaving={isSaving}
          isDirty={isDirty}
          error={saveError}
          onRetry={() => onForceSave()}
        />
        <ShortcutHelp />

        <div className="w-px h-5 bg-slate-800" />

        <button
          onClick={onExport}
          disabled={isExporting}
          className="group relative bg-gradient-to-b from-violet-500 to-violet-600 hover:from-violet-400 hover:to-violet-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-semibold px-3.5 py-1.5 rounded-md flex items-center gap-1.5 shadow-[0_1px_0_rgba(255,255,255,0.15)_inset,0_1px_3px_rgba(124,58,237,0.4)] transition-all"
        >
          {isExporting ? (
            <span className="w-3 h-3 border border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
          )}
          Export PDF
        </button>
      </div>
    </header>
  );
}

function ToolButton({
  children,
  onClick,
  disabled,
  title,
  ariaLabel,
}: {
  children: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
  title: string;
  ariaLabel: string;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={title}
      aria-label={ariaLabel}
      className="w-7 h-7 rounded-md text-slate-400 hover:text-slate-100 hover:bg-slate-800/70 disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-transparent grid place-items-center transition-colors"
    >
      {children}
    </button>
  );
}

function SaveStatus({
  isSaving,
  isDirty,
  error,
  onRetry,
}: {
  isSaving: boolean;
  isDirty: boolean;
  error: string | null;
  onRetry: () => void;
}) {
  if (error) {
    return (
      <button
        onClick={onRetry}
        className="group flex items-center gap-1.5 text-[11px] text-red-300 hover:text-red-200 px-2 py-1 rounded-md hover:bg-red-500/10 border border-red-500/30 transition-colors"
        title={`Last save failed: ${error}\nClick to retry.`}
      >
        <span className="w-1.5 h-1.5 rounded-full bg-red-400" />
        Save failed
        <span className="opacity-60 group-hover:opacity-100 text-[10px] underline underline-offset-2">
          retry
        </span>
      </button>
    );
  }
  if (isSaving) {
    return (
      <span className="flex items-center gap-1.5 text-[11px] text-slate-500 select-none">
        <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
        Saving…
      </span>
    );
  }
  if (isDirty) {
    return (
      <span className="flex items-center gap-1.5 text-[11px] text-slate-500 select-none">
        <span className="w-1.5 h-1.5 rounded-full bg-amber-400/70" />
        Unsaved
      </span>
    );
  }
  return (
    <span className="flex items-center gap-1.5 text-[11px] text-slate-600 select-none">
      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
      Saved
    </span>
  );
}
