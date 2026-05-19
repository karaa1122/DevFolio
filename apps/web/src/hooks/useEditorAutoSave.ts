'use client';

import { useEffect, useRef, useCallback } from 'react';
import { useEditorStore } from '@/store/editor.store';
import { portfolioApi } from '@/lib/api';

const AUTO_SAVE_DELAY_MS = 2000;

export function useEditorAutoSave() {
  const { portfolio, isDirty, setIsSaving, markClean } = useEditorStore();
  const portfolioRef = useRef(portfolio);
  portfolioRef.current = portfolio;

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const scheduleSave = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(async () => {
      const current = portfolioRef.current;
      if (!current) return;
      setIsSaving(true);
      try {
        await portfolioApi.update(current.id, current);
        markClean();
      } catch (err) {
        console.error('Auto-save failed:', err);
      } finally {
        setIsSaving(false);
      }
    }, AUTO_SAVE_DELAY_MS);
  }, [setIsSaving, markClean]);

  useEffect(() => {
    if (!isDirty) return;
    scheduleSave();
  }, [isDirty, portfolio, scheduleSave]);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);
}
