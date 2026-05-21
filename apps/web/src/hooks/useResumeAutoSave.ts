'use client';

import { useEffect, useRef, useCallback } from 'react';
import { useResumeStore } from '@/store/resume.store';
import { resumeApi } from '@/lib/api';

const AUTO_SAVE_DELAY_MS = 2000;

export function useResumeAutoSave(resumeId: string) {
  const { resume, isDirty, setIsSaving, markClean } = useResumeStore();
  const resumeRef = useRef(resume);
  resumeRef.current = resume;

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const scheduleSave = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(async () => {
      const current = resumeRef.current;
      if (!current) return;
      setIsSaving(true);
      try {
        await resumeApi.update(resumeId, current);
        markClean();
      } catch (err) {
        console.error('Resume auto-save failed:', err);
      } finally {
        setIsSaving(false);
      }
    }, AUTO_SAVE_DELAY_MS);
  }, [resumeId, setIsSaving, markClean]);

  useEffect(() => {
    if (!isDirty) return;
    scheduleSave();
  }, [isDirty, resume, scheduleSave]);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);
}
