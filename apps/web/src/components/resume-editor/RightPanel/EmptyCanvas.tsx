'use client';

import { useResumeStore } from '@/store/resume.store';
import { makeSection } from '../sectionDefaults';

const STARTER_TYPES = ['header', 'summary', 'experience', 'projects', 'skills', 'education'] as const;

/**
 * Shown when the resume has zero sections. Offers a one-click starter set and
 * an option to add sections individually.
 */
export function EmptyCanvas() {
  const addSection = useResumeStore((s) => s.addSection);
  const setActivePanel = useResumeStore((s) => s.setActivePanel);

  const addStarter = () => {
    for (const type of STARTER_TYPES) {
      addSection(makeSection(type));
    }
  };

  return (
    <div className="flex flex-col items-center justify-center text-center max-w-md px-8 py-20">
      <div className="relative mb-7">
        <div className="w-24 h-32 rounded-md bg-slate-900/80 border border-slate-800 shadow-2xl flex flex-col gap-1.5 p-3">
          <div className="h-2 w-2/3 rounded-full bg-slate-700" />
          <div className="h-1.5 w-1/2 rounded-full bg-slate-800" />
          <div className="mt-2 h-1 w-full rounded-full bg-slate-800" />
          <div className="h-1 w-5/6 rounded-full bg-slate-800" />
          <div className="h-1 w-4/6 rounded-full bg-slate-800" />
          <div className="mt-1.5 h-1 w-full rounded-full bg-slate-800" />
          <div className="h-1 w-5/6 rounded-full bg-slate-800" />
        </div>
        <div className="absolute -bottom-2 -right-2 w-9 h-9 rounded-full bg-gradient-to-br from-violet-400 to-violet-600 grid place-items-center shadow-lg shadow-violet-500/30">
          <span className="text-white text-lg leading-none">+</span>
        </div>
      </div>

      <h2 className="text-xl font-semibold text-slate-100 mb-2 tracking-tight">
        A blank page, ready
      </h2>
      <p className="text-sm text-slate-500 mb-7 leading-relaxed max-w-xs">
        Drop in a starter set of sections, or build it up piece by piece. Every change reflects
        instantly on the right.
      </p>

      <div className="flex gap-2.5">
        <button
          onClick={addStarter}
          className="bg-gradient-to-b from-violet-500 to-violet-600 hover:from-violet-400 hover:to-violet-500 text-white text-sm font-semibold px-4 py-2.5 rounded-lg shadow-lg shadow-violet-500/20 transition-all"
        >
          Add starter sections
        </button>
        <button
          onClick={() => setActivePanel('sections')}
          className="bg-slate-800/60 hover:bg-slate-800 border border-slate-700 text-slate-200 text-sm font-medium px-4 py-2.5 rounded-lg transition-colors"
        >
          One at a time
        </button>
      </div>
    </div>
  );
}
