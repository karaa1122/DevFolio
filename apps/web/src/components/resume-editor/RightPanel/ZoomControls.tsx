'use client';

import { useResumeStore } from '@/store/resume.store';

const STEPS = [0.5, 0.75, 1, 1.25, 1.5];

export function ZoomControls() {
  const zoom = useResumeStore((s) => s.zoom);
  const setZoom = useResumeStore((s) => s.setZoom);
  const pageCount = useResumeStore((s) => s.pageCount);
  const currentPage = useResumeStore((s) => s.currentPage);

  return (
    <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex items-center gap-0.5 bg-slate-900/95 border border-slate-800 rounded-full shadow-2xl backdrop-blur-xl px-1.5 py-1 z-20">
      {pageCount > 1 && (
        <>
          <span className="text-[10px] text-slate-500 font-mono tabular-nums px-2 select-none">
            {currentPage} / {pageCount}
          </span>
          <span className="w-px h-4 bg-slate-800 mx-0.5" />
        </>
      )}

      <button
        onClick={() => setZoom(zoom - 0.1)}
        className="text-slate-400 hover:text-slate-100 w-7 h-7 rounded-full grid place-items-center transition-colors"
        aria-label="Zoom out"
        title="Zoom out"
      >
        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
          <line x1="5" y1="12" x2="19" y2="12" />
        </svg>
      </button>

      <select
        value={STEPS.includes(zoom) ? String(zoom) : 'custom'}
        onChange={(e) => {
          const v = parseFloat(e.target.value);
          if (!Number.isNaN(v)) setZoom(v);
        }}
        className="bg-transparent text-slate-200 text-[11px] font-mono tabular-nums px-1.5 py-0.5 focus:outline-none cursor-pointer w-[52px] text-center"
      >
        {!STEPS.includes(zoom) && (
          <option value="custom" className="bg-slate-900">{Math.round(zoom * 100)}%</option>
        )}
        {STEPS.map((s) => (
          <option key={s} value={s} className="bg-slate-900">
            {Math.round(s * 100)}%
          </option>
        ))}
      </select>

      <button
        onClick={() => setZoom(zoom + 0.1)}
        className="text-slate-400 hover:text-slate-100 w-7 h-7 rounded-full grid place-items-center transition-colors"
        aria-label="Zoom in"
        title="Zoom in"
      >
        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
          <line x1="12" y1="5" x2="12" y2="19" />
          <line x1="5" y1="12" x2="19" y2="12" />
        </svg>
      </button>

      <span className="w-px h-4 bg-slate-800 mx-0.5" />

      <button
        onClick={() => setZoom(0.75)}
        className="text-slate-400 hover:text-slate-100 text-[11px] px-2.5 py-1 rounded-full hover:bg-slate-800/70 transition-colors"
        title="Fit to view"
      >
        Fit
      </button>
      <button
        onClick={() => setZoom(1)}
        className="text-slate-400 hover:text-slate-100 text-[11px] px-2.5 py-1 rounded-full hover:bg-slate-800/70 transition-colors"
        title="Actual size (100%)"
      >
        1:1
      </button>
    </div>
  );
}
