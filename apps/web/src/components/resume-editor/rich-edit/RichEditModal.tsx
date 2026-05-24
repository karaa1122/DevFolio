'use client';

import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { RichEditor } from './RichEditor';

interface Props {
  open: boolean;
  title: string;
  initialValue: string;
  placeholder?: string;
  onSave: (html: string) => void;
  onClose: () => void;
}

export function RichEditModal({
  open,
  title,
  initialValue,
  placeholder,
  onSave,
  onClose,
}: Props) {
  const [value, setValue] = useState(initialValue);
  const [mounted, setMounted] = useState(false);
  const overlayRef = useRef<HTMLDivElement>(null);

  // Defer portal until after first client paint to avoid SSR hydration issues.
  useEffect(() => {
    setMounted(true);
  }, []);

  // Snapshot the value each time the modal re-opens so cancel cleanly discards.
  useEffect(() => {
    if (open) setValue(initialValue);
  }, [open, initialValue]);

  // Close on Escape; trap scroll on body while open.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };
    document.addEventListener('keydown', onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [open, onClose]);

  if (!mounted || !open) return null;

  const handleSave = () => {
    onSave(value);
    onClose();
  };

  return createPortal(
    <div
      ref={overlayRef}
      onMouseDown={(e) => {
        // Close when clicking the backdrop, but not when the click started
        // inside the dialog and drifted to the backdrop on release.
        if (e.target === overlayRef.current) onClose();
      }}
      className="fixed inset-0 z-50 grid place-items-center bg-slate-950/80 backdrop-blur-sm p-6 animate-in fade-in duration-150"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="rich-edit-modal-title"
        className="relative w-full max-w-3xl flex flex-col rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl shadow-violet-500/5 animate-in slide-in-from-bottom-4 duration-200 overflow-hidden"
      >
        <header className="flex items-center justify-between px-5 py-4 border-b border-slate-800 shrink-0">
          <h2 id="rich-edit-modal-title" className="text-base font-semibold text-slate-100">
            {title}
          </h2>
          <button
            onClick={onClose}
            className="text-slate-500 hover:text-slate-200 w-8 h-8 rounded-md hover:bg-slate-800/70 grid place-items-center transition-colors"
            aria-label="Close"
            title="Close (Esc)"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </header>

        <div className="flex-1 min-h-0 overflow-hidden">
          <RichEditor
            value={value}
            onChange={setValue}
            placeholder={placeholder}
            block
            autoFocus
            minHeight={440}
          />
        </div>

        <footer className="flex items-center justify-between gap-3 px-5 py-3.5 border-t border-slate-800 bg-slate-900/60 shrink-0">
          <span className="text-[11px] text-slate-500 select-none">
            Esc to cancel · Ctrl+B bold · Ctrl+I italic · Ctrl+U underline
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="text-sm text-slate-400 hover:text-slate-100 px-4 py-2 rounded-lg hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="bg-gradient-to-b from-violet-500 to-violet-600 hover:from-violet-400 hover:to-violet-500 text-white text-sm font-semibold px-5 py-2 rounded-lg shadow-lg shadow-violet-500/20 transition-all flex items-center gap-1.5"
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              Done
            </button>
          </div>
        </footer>
      </div>
    </div>,
    document.body,
  );
}
