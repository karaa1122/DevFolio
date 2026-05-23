'use client';

import { useEffect, useState } from 'react';

const SHORTCUTS: { keys: string; label: string }[] = [
  { keys: 'Ctrl/⌘ + Z', label: 'Undo' },
  { keys: 'Ctrl/⌘ + Shift + Z', label: 'Redo' },
  { keys: 'Ctrl/⌘ + S', label: 'Save (auto by default)' },
  { keys: 'Ctrl/⌘ + +', label: 'Zoom in' },
  { keys: 'Ctrl/⌘ + −', label: 'Zoom out' },
  { keys: 'Ctrl/⌘ + 0', label: 'Reset zoom' },
  { keys: 'Click a section on the page', label: 'Edit it in the left panel' },
  { keys: 'Drag a section in the left panel', label: 'Reorder' },
  { keys: '?', label: 'Open this help' },
  { keys: 'Esc', label: 'Close this help' },
];

export function ShortcutHelp() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      const inField =
        target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable;
      if (e.key === 'Escape' && open) {
        setOpen(false);
        return;
      }
      if (inField) return;
      if (e.key === '?' || (e.shiftKey && e.key === '/')) {
        e.preventDefault();
        setOpen((v) => !v);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="text-slate-500 hover:text-slate-100 hover:bg-slate-800 w-7 h-7 rounded grid place-items-center text-xs transition-colors"
        title="Keyboard shortcuts (?)"
      >
        ?
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 grid place-items-center bg-black/60 backdrop-blur-sm"
          onClick={() => setOpen(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl w-[440px] max-w-[90vw] p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-slate-100">Keyboard shortcuts</h2>
              <button
                onClick={() => setOpen(false)}
                className="text-slate-500 hover:text-slate-200 text-lg leading-none"
              >
                ×
              </button>
            </div>

            <dl className="space-y-2">
              {SHORTCUTS.map(({ keys, label }) => (
                <div
                  key={keys}
                  className="flex items-center justify-between gap-4 text-sm"
                >
                  <dt className="text-slate-400">{label}</dt>
                  <dd className="font-mono text-xs text-slate-200 bg-slate-800 border border-slate-700 px-2 py-1 rounded shrink-0">
                    {keys}
                  </dd>
                </div>
              ))}
            </dl>

            <p className="text-[11px] text-slate-500 mt-4 leading-relaxed">
              Changes save automatically as you type. Export PDF anytime — Chromium renders it at
              native print resolution.
            </p>
          </div>
        </div>
      )}
    </>
  );
}
