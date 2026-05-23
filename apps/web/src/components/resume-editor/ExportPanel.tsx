'use client';

import type { ExportJob } from '@devfolio/shared';

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';

type ExportPanelState =
  | { phase: 'saving' }
  | { phase: 'queuing' }
  | { phase: 'polling'; job: ExportJob }
  | { phase: 'done'; job: ExportJob }
  | { phase: 'error'; message: string; retry: boolean };

interface Props {
  state: ExportPanelState;
  onClose: () => void;
  onRetry: () => void;
  onBrowserPrint: () => void;
}

export function ExportPanel({ state, onClose, onRetry, onBrowserPrint }: Props) {
  return (
    <div className="absolute top-4 right-4 w-80 z-20 animate-in fade-in slide-in-from-top-2 duration-200">
      <div className="bg-slate-900/95 border border-slate-700/70 rounded-xl shadow-2xl backdrop-blur-xl overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800/80">
          <div className="flex items-center gap-2">
            <span className="w-7 h-7 rounded-md bg-gradient-to-br from-violet-500/30 to-violet-600/30 border border-violet-500/30 grid place-items-center">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="text-violet-300">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
              </svg>
            </span>
            <span className="text-sm font-semibold text-slate-100">Export PDF</span>
          </div>
          <button
            onClick={onClose}
            className="text-slate-500 hover:text-slate-200 text-base leading-none w-6 h-6 rounded grid place-items-center hover:bg-slate-800/60 transition-colors"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        <div className="p-4">{renderBody(state, onRetry, onBrowserPrint)}</div>
      </div>
    </div>
  );
}

function renderBody(
  state: ExportPanelState,
  onRetry: () => void,
  onBrowserPrint: () => void,
) {
  if (state.phase === 'saving' || state.phase === 'queuing') {
    const label = state.phase === 'saving' ? 'Saving latest changes…' : 'Queuing render…';
    return (
      <div className="space-y-3">
        <ProgressLine label={label} pct={state.phase === 'saving' ? 18 : 38} />
        <FootHint>Step 1 of 3 — making sure the worker reads the freshest data.</FootHint>
      </div>
    );
  }

  if (state.phase === 'polling') {
    const isProcessing = state.job.status === 'processing';
    return (
      <div className="space-y-3">
        <ProgressLine
          label={isProcessing ? 'Rendering PDF…' : 'Waiting for worker…'}
          pct={isProcessing ? 72 : 55}
        />
        <FootHint>
          {isProcessing
            ? 'Chromium is printing your resume at native print resolution. Usually 3–8 s.'
            : 'The render job is queued. The worker will pick it up shortly.'}
        </FootHint>
      </div>
    );
  }

  if (state.phase === 'done') {
    return (
      <div className="space-y-3.5">
        <div className="flex items-start gap-2">
          <span className="w-5 h-5 rounded-full bg-emerald-500/20 border border-emerald-500/40 grid place-items-center mt-0.5 shrink-0">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="text-emerald-400">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </span>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium text-emerald-200">Your PDF is ready</div>
            <div className="text-[11px] text-slate-500 mt-0.5">
              Selectable text · ATS-friendly · Matches the preview pixel for pixel
            </div>
          </div>
        </div>
        <a
          href={`${API_BASE}${state.job.fileUrl}`}
          download
          className="block w-full text-center bg-gradient-to-b from-violet-500 to-violet-600 hover:from-violet-400 hover:to-violet-500 text-white text-sm font-semibold py-2.5 rounded-lg shadow-lg shadow-violet-500/20 transition-all"
        >
          Download PDF
        </a>
        <button
          onClick={onBrowserPrint}
          className="block w-full text-center text-[11px] text-slate-500 hover:text-slate-300 py-1 transition-colors"
        >
          Or use browser print (Ctrl+P)
        </button>
      </div>
    );
  }

  // error
  return (
    <div className="space-y-3">
      <div className="flex items-start gap-2">
        <span className="w-5 h-5 rounded-full bg-red-500/20 border border-red-500/40 grid place-items-center mt-0.5 shrink-0">
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="text-red-400">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </span>
        <div className="flex-1 min-w-0">
          <div className="text-sm font-medium text-red-200">Export failed</div>
          <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed break-words">
            {state.message}
          </p>
        </div>
      </div>
      <div className="flex gap-2">
        {state.retry && (
          <button
            onClick={onRetry}
            className="flex-1 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-100 text-xs font-medium py-2 rounded-lg transition-colors"
          >
            Try again
          </button>
        )}
        <button
          onClick={onBrowserPrint}
          className="flex-1 bg-slate-800/60 hover:bg-slate-800 border border-slate-700 text-slate-200 text-xs font-medium py-2 rounded-lg transition-colors"
        >
          Use browser print
        </button>
      </div>
      <FootHint>
        If retrying doesn&apos;t help, the export worker may be offline. Browser print uses your
        OS dialog and always works.
      </FootHint>
    </div>
  );
}

function ProgressLine({ label, pct }: { label: string; pct: number }) {
  return (
    <>
      <div className="flex items-center gap-2 text-slate-200 text-sm">
        <span className="w-3.5 h-3.5 border-2 border-slate-700 border-t-violet-400 rounded-full animate-spin shrink-0" />
        {label}
      </div>
      <div className="w-full bg-slate-800/80 rounded-full h-1 overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-violet-500 to-violet-400 rounded-full transition-[width] duration-500 ease-out"
          style={{ width: `${pct}%` }}
        />
      </div>
    </>
  );
}

function FootHint({ children }: { children: React.ReactNode }) {
  return <p className="text-[11px] text-slate-500 leading-relaxed">{children}</p>;
}
