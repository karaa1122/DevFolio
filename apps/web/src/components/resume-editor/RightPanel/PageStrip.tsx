'use client';

import { useResumeStore } from '@/store/resume.store';

export function PageStrip() {
  const pageCount = useResumeStore((s) => s.pageCount);
  const currentPage = useResumeStore((s) => s.currentPage);
  const setCurrentPage = useResumeStore((s) => s.setCurrentPage);

  if (pageCount <= 1) return null;

  const go = (page: number) => {
    setCurrentPage(page);
    const el = document.querySelector(`.resume-page[data-page-index="${page}"]`);
    el?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div className="absolute top-5 right-5 flex flex-col gap-1.5 z-10">
      {Array.from({ length: pageCount }, (_, i) => i + 1).map((n) => {
        const active = currentPage === n;
        return (
          <button
            key={n}
            onClick={() => go(n)}
            className={`relative w-10 h-12 rounded-md border text-[11px] font-medium grid place-items-center transition-all ${
              active
                ? 'bg-violet-500/20 border-violet-400 text-violet-50 shadow-lg shadow-violet-500/20'
                : 'bg-slate-900/80 border-slate-800 text-slate-500 hover:border-slate-600 hover:text-slate-300'
            }`}
            aria-label={`Page ${n}`}
          >
            <div
              className={`w-5 h-7 mb-0.5 rounded-sm border ${
                active ? 'border-violet-300/60 bg-violet-300/20' : 'border-slate-700 bg-slate-800/40'
              }`}
            />
            <span className="absolute bottom-0.5 text-[9px] font-mono">{n}</span>
          </button>
        );
      })}
    </div>
  );
}
