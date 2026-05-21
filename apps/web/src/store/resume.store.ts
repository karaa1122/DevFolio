'use client';

import { create, useStore } from 'zustand';
import { temporal } from 'zundo';
import { immer } from 'zustand/middleware/immer';
import type { Resume, ResumeSection, ResumeTheme } from '@devfolio/shared';
import { generateId } from '@/lib/utils';

interface ResumeEditorState {
  resume: Resume | null;
  selectedSectionId: string | null;
  activePanel: 'sections' | 'theme' | 'settings';
  mode: 'edit' | 'preview';
  isDirty: boolean;
  isSaving: boolean;
  lastSavedAt: Date | null;
}

interface ResumeEditorActions {
  setResume: (resume: Resume) => void;
  markClean: () => void;
  setIsSaving: (saving: boolean) => void;

  updateTheme: (patch: Partial<ResumeTheme>) => void;

  addSection: (section: Omit<ResumeSection, 'id'> & { id?: string }) => void;
  updateSectionData: (id: string, data: Partial<ResumeSection['data']>) => void;
  updateSectionVisibility: (id: string, visible: boolean) => void;
  removeSection: (id: string) => void;
  reorderSections: (fromIndex: number, toIndex: number) => void;

  selectSection: (id: string | null) => void;
  setMode: (mode: 'edit' | 'preview') => void;
  setActivePanel: (panel: ResumeEditorState['activePanel']) => void;

  updateMetadata: (patch: Partial<Resume['metadata']>) => void;
  updateTitle: (title: string) => void;
}

type ResumeEditorStore = ResumeEditorState & ResumeEditorActions;

const initialState: ResumeEditorState = {
  resume: null,
  selectedSectionId: null,
  activePanel: 'sections',
  mode: 'edit',
  isDirty: false,
  isSaving: false,
  lastSavedAt: null,
};

export const useResumeStore = create<ResumeEditorStore>()(
  temporal(
    immer<ResumeEditorStore>((set) => ({
      ...initialState,

      setResume: (resume) =>
        set((s) => {
          s.resume = resume;
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
          if (!s.resume) return;
          Object.assign(s.resume.theme, patch);
          s.isDirty = true;
        }),

      addSection: (section) =>
        set((s) => {
          if (!s.resume) return;
          const id = (section as ResumeSection & { id?: string }).id ?? generateId();
          const newSection = { ...section, id } as ResumeSection;
          s.resume.sections.push(newSection);
          s.resume.layout.sectionsOrder.push(id);
          s.selectedSectionId = id;
          s.isDirty = true;
        }),

      updateSectionData: (id, data) =>
        set((s) => {
          if (!s.resume) return;
          const idx = s.resume.sections.findIndex((sec) => sec.id === id);
          if (idx === -1) return;
          Object.assign(s.resume.sections[idx].data, data);
          s.isDirty = true;
        }),

      updateSectionVisibility: (id, visible) =>
        set((s) => {
          if (!s.resume) return;
          const section = s.resume.sections.find((sec) => sec.id === id);
          if (section) {
            section.visible = visible;
            s.isDirty = true;
          }
        }),

      removeSection: (id) =>
        set((s) => {
          if (!s.resume) return;
          s.resume.sections = s.resume.sections.filter((sec) => sec.id !== id);
          s.resume.layout.sectionsOrder = s.resume.layout.sectionsOrder.filter(
            (sid) => sid !== id,
          );
          if (s.selectedSectionId === id) s.selectedSectionId = null;
          s.isDirty = true;
        }),

      reorderSections: (fromIndex, toIndex) =>
        set((s) => {
          if (!s.resume) return;
          const order = s.resume.layout.sectionsOrder;
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
          if (!s.resume) return;
          Object.assign(s.resume.metadata, patch);
          s.isDirty = true;
        }),

      updateTitle: (title) =>
        set((s) => {
          if (!s.resume) return;
          s.resume.title = title;
          s.isDirty = true;
        }),
    })),
    {
      limit: 50,
      partialize: (state) => ({ resume: state.resume }),
      equality: (a, b) => JSON.stringify(a) === JSON.stringify(b),
    },
  ),
);

export const useResumeHistory = () => useStore(useResumeStore.temporal);
