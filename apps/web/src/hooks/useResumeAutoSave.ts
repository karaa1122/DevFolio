'use client';

import { useEffect, useRef, useCallback } from 'react';
import { useResumeStore } from '@/store/resume.store';
import { resumeApi } from '@/lib/api';

const AUTO_SAVE_DELAY_MS = 1200;

/**
 * Saves the in-memory resume to the backend, debounced after edits.
 *
 * IMPORTANT: takes the *entity* id explicitly. The store holds `resume.data`
 * which has its own UUID inside the JSON blob — distinct from the DB row's
 * primary key. Using `current.id` would PATCH the wrong URL and 404 silently.
 */
export function useResumeAutoSave(resumeId: string) {
  const { resume, isDirty, setIsSaving, markClean, setSaveError } = useResumeStore();
  const resumeRef = useRef(resume);
  resumeRef.current = resume;

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const flushNow = useCallback(async () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    const current = resumeRef.current;
    if (!current) return;
    setIsSaving(true);
    try {
      await resumeApi.update(resumeId, current);
      markClean();
    } catch (err) {
      console.error('[Resume autosave] failed:', err);
      const msg = err instanceof Error ? err.message : 'Failed to save';
      setSaveError(msg);
    } finally {
      setIsSaving(false);
    }
  }, [resumeId, setIsSaving, markClean, setSaveError]);

  const scheduleSave = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(flushNow, AUTO_SAVE_DELAY_MS);
  }, [flushNow]);

  useEffect(() => {
    if (!isDirty) return;
    scheduleSave();
  }, [isDirty, resume, scheduleSave]);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  return { flushNow };
}
