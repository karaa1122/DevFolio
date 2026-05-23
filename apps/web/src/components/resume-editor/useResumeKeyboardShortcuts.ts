'use client';

import { useEffect } from 'react';
import { useResumeStore } from '@/store/resume.store';

interface Options {
  /** Called when the user presses Ctrl/Cmd+S — should flush autosave immediately. */
  onForceSave?: () => void;
}

export function useResumeKeyboardShortcuts({ onForceSave }: Options = {}) {
  const setZoom = useResumeStore((s) => s.setZoom);
  const zoom = useResumeStore((s) => s.zoom);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      const inField =
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable;

      const meta = e.metaKey || e.ctrlKey;

      // Ctrl/Cmd + S — swallow the browser's "Save Page As" and force-flush
      // the pending autosave so the user gets immediate persistence feedback.
      if (meta && e.key.toLowerCase() === 's') {
        e.preventDefault();
        onForceSave?.();
        return;
      }

      // Ctrl/Cmd + P — print preview. Let the browser handle it; the resume
      // canvas is already styled for @page output.

      if (meta && e.key.toLowerCase() === 'z' && !e.shiftKey) {
        e.preventDefault();
        useResumeStore.temporal.getState().undo();
        return;
      }
      if (meta && (e.key.toLowerCase() === 'y' || (e.shiftKey && e.key.toLowerCase() === 'z'))) {
        e.preventDefault();
        useResumeStore.temporal.getState().redo();
        return;
      }

      if (inField) return;

      if (meta && (e.key === '=' || e.key === '+')) {
        e.preventDefault();
        setZoom(zoom + 0.1);
      } else if (meta && e.key === '-') {
        e.preventDefault();
        setZoom(zoom - 0.1);
      } else if (meta && e.key === '0') {
        e.preventDefault();
        setZoom(1);
      }
    };

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [setZoom, zoom, onForceSave]);
}
