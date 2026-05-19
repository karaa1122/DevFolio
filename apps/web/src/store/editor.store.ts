'use client';

import { create, useStore } from 'zustand';
import { temporal } from 'zundo';
import { immer } from 'zustand/middleware/immer';
import type { Portfolio, Section, Theme } from '@devfolio/shared';
import { generateId } from '@/lib/utils';

interface EditorState {
  portfolio: Portfolio | null;
  selectedSectionId: string | null;
  activePanel: 'sections' | 'theme' | 'settings';
  mode: 'edit' | 'preview';
  isDirty: boolean;
  isSaving: boolean;
  lastSavedAt: Date | null;
}

interface EditorActions {
  // Portfolio lifecycle
  setPortfolio: (portfolio: Portfolio) => void;
  markClean: () => void;
  setIsSaving: (saving: boolean) => void;

  // Theme
  updateTheme: (patch: Partial<Theme>) => void;

  // Sections
  addSection: (section: Omit<Section, 'id'> & { id?: string }) => void;
  updateSectionData: (id: string, data: Partial<Section['data']>) => void;
  updateSectionVisibility: (id: string, visible: boolean) => void;
  removeSection: (id: string) => void;
  reorderSections: (fromIndex: number, toIndex: number) => void;

  // Selection
  selectSection: (id: string | null) => void;

  // UI
  setMode: (mode: 'edit' | 'preview') => void;
  setActivePanel: (panel: EditorState['activePanel']) => void;

  // Metadata
  updateMetadata: (patch: Partial<Portfolio['metadata']>) => void;
}

type EditorStore = EditorState & EditorActions;

const initialState: EditorState = {
  portfolio: null,
  selectedSectionId: null,
  activePanel: 'sections',
  mode: 'edit',
  isDirty: false,
  isSaving: false,
  lastSavedAt: null,
};

export const useEditorStore = create<EditorStore>()(
  temporal(
    immer<EditorStore>((set) => ({

      ...initialState,

      setPortfolio: (portfolio) =>
        set((s) => {
          s.portfolio = portfolio;
          s.isDirty = false;
          s.lastSavedAt = new Date();
        }),

      markClean: () =>
        set((s) => {
          s.isDirty = false;
          s.lastSavedAt = new Date();
        }),

      setIsSaving: (saving) =>
        set((s) => {
          s.isSaving = saving;
        }),

      updateTheme: (patch) =>
        set((s) => {
          if (!s.portfolio) return;
          const { colors, ...rest } = patch;
          Object.assign(s.portfolio.theme, rest);
          if (colors) Object.assign(s.portfolio.theme.colors, colors);
          s.isDirty = true;
        }),

      addSection: (section) =>
        set((s) => {
          if (!s.portfolio) return;
          const id = section.id ?? generateId();
          const newSection = { ...section, id } as Section;
          s.portfolio.sections.push(newSection);
          s.portfolio.layout.sectionsOrder.push(id);
          s.selectedSectionId = id;
          s.isDirty = true;
        }),

      updateSectionData: (id, data) =>
        set((s) => {
          if (!s.portfolio) return;
          const idx = s.portfolio.sections.findIndex((sec) => sec.id === id);
          if (idx === -1) return;
          Object.assign(s.portfolio.sections[idx].data, data);
          s.isDirty = true;
        }),

      updateSectionVisibility: (id, visible) =>
        set((s) => {
          if (!s.portfolio) return;
          const section = s.portfolio.sections.find((sec) => sec.id === id);
          if (section) {
            section.visible = visible;
            s.isDirty = true;
          }
        }),

      removeSection: (id) =>
        set((s) => {
          if (!s.portfolio) return;
          s.portfolio.sections = s.portfolio.sections.filter((sec) => sec.id !== id);
          s.portfolio.layout.sectionsOrder = s.portfolio.layout.sectionsOrder.filter(
            (sid) => sid !== id,
          );
          if (s.selectedSectionId === id) s.selectedSectionId = null;
          s.isDirty = true;
        }),

      reorderSections: (fromIndex, toIndex) =>
        set((s) => {
          if (!s.portfolio) return;
          const order = s.portfolio.layout.sectionsOrder;
          const [moved] = order.splice(fromIndex, 1);
          order.splice(toIndex, 0, moved);
          s.isDirty = true;
        }),

      selectSection: (id) =>
        set((s) => {
          s.selectedSectionId = id;
          if (id) s.activePanel = 'sections';
        }),

      setMode: (mode) =>
        set((s) => {
          s.mode = mode;
        }),

      setActivePanel: (panel) =>
        set((s) => {
          s.activePanel = panel;
        }),

      updateMetadata: (patch) =>
        set((s) => {
          if (!s.portfolio) return;
          Object.assign(s.portfolio.metadata, patch);
          s.isDirty = true;
        }),
    })),
    {
      limit: 50,
      // Only track portfolio changes in history
      partialize: (state) => ({ portfolio: state.portfolio }),
      equality: (a, b) => JSON.stringify(a) === JSON.stringify(b),
    },
  ),
);

// Callable hook for undo/redo — wraps the StoreApi with useStore
export const useEditorHistory = () => useStore(useEditorStore.temporal);
