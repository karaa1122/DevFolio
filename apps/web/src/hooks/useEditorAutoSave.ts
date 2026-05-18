'use client';

import { useEffect, useRef } from 'react';
import { useEditorStore } from '@/store/editor.store';
import { portfolioApi } from '@/lib/api';
import { debounce } from '@/lib/utils';

const AUTO_SAVE_DELAY_MS = 2000;

export function useEditorAutoSave() {
  const { portfolio, isDirty, isSaving, setIsSaving, markClean } = useEditorStore();
  const portfolioRef = useRef(portfolio);
  portfolioRef.current = portfolio;

  const save = debounce(async () => {
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
  }, AUTO_SAVE_DELAY_MS) as () => void;

  useEffect(() => {
    if (isDirty && !isSaving) {
      save();
    }
  }, [isDirty, portfolio]);
}
