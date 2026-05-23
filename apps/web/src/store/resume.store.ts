'use client';

import { create, useStore } from 'zustand';
import { temporal } from 'zundo';
import { immer } from 'zustand/middleware/immer';
import type {
  Resume,
  ResumeSection,
  ResumeTheme,
  ResumeTemplateId,
} from '@devfolio/shared';
import { generateId } from '@/lib/utils';

type ActivePanel = 'sections' | 'design' | 'import' | 'settings';

interface ResumeEditorState {
  resume: Resume | null;
  selectedSectionId: string | null;
  selectedItemId: string | null;
  activePanel: ActivePanel;
  zoom: number;
  currentPage: number;
  pageCount: number;
  isDirty: boolean;
  isSaving: boolean;
  lastSavedAt: Date | null;
  /** Last autosave error (if any). Null when the most recent save succeeded. */
  saveError: string | null;
}

interface ResumeEditorActions {
  // Resume lifecycle
  setResume: (resume: Resume) => void;
  markClean: () => void;
  setIsSaving: (saving: boolean) => void;
  setSaveError: (message: string | null) => void;

  // Template + theme + page + density
  setTemplate: (id: ResumeTemplateId) => void;
  updateTheme: (patch: Partial<ResumeTheme>) => void;
  updatePage: (patch: Partial<Resume['page']>) => void;
  setDensity: (d: Resume['density']) => void;
  setAts: (ats: boolean) => void;
  updateMetadata: (patch: Partial<Resume['metadata']>) => void;

  // Sections
  addSection: (section: Omit<ResumeSection, 'id'> & { id?: string }) => void;
  updateSectionData: (id: string, data: Partial<any>) => void;
  updateSectionVisibility: (id: string, visible: boolean) => void;
  removeSection: (id: string) => void;
  reorderSections: (fromIndex: number, toIndex: number) => void;
  duplicateSection: (id: string) => void;

  // Item-level (experience.items, projects.items, etc.)
  addItemToSection: <T = unknown>(sectionId: string, item: T) => void;
  updateItemInSection: <T = unknown>(
    sectionId: string,
    itemId: string,
    patch: Partial<T>,
  ) => void;
  removeItemFromSection: (sectionId: string, itemId: string) => void;
  reorderItemsInSection: (sectionId: string, fromIndex: number, toIndex: number) => void;

  // Selection
  selectSection: (id: string | null) => void;
  selectItem: (id: string | null) => void;

  // UI
  setActivePanel: (panel: ActivePanel) => void;
  setZoom: (zoom: number) => void;
  setCurrentPage: (page: number) => void;
  setPageCount: (count: number) => void;
}

type ResumeEditorStore = ResumeEditorState & ResumeEditorActions;

const initialState: ResumeEditorState = {
  resume: null,
  selectedSectionId: null,
  selectedItemId: null,
  activePanel: 'sections',
  zoom: 1,
  currentPage: 1,
  pageCount: 1,
  isDirty: false,
  isSaving: false,
  lastSavedAt: null,
  saveError: null,
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
          s.saveError = null;
        }),

      markClean: () =>
        set((s) => {
          s.isDirty = false;
          s.lastSavedAt = new Date();
          s.saveError = null;
        }),

      setIsSaving: (saving) =>
        set((s) => {
          s.isSaving = saving;
        }),

      setSaveError: (message) =>
        set((s) => {
          s.saveError = message;
        }),

      setTemplate: (id) =>
        set((s) => {
          if (!s.resume) return;
          s.resume.template = id;
          s.isDirty = true;
        }),

      updateTheme: (patch) =>
        set((s) => {
          if (!s.resume) return;
          Object.assign(s.resume.theme, patch);
          s.isDirty = true;
        }),

      updatePage: (patch) =>
        set((s) => {
          if (!s.resume) return;
          Object.assign(s.resume.page, patch);
          s.isDirty = true;
        }),

      setDensity: (d) =>
        set((s) => {
          if (!s.resume) return;
          s.resume.density = d;
          s.isDirty = true;
        }),

      setAts: (ats) =>
        set((s) => {
          if (!s.resume) return;
          s.resume.ats = ats;
          s.isDirty = true;
        }),

      updateMetadata: (patch) =>
        set((s) => {
          if (!s.resume) return;
          Object.assign(s.resume.metadata, patch);
          s.isDirty = true;
        }),

      addSection: (section) =>
        set((s) => {
          if (!s.resume) return;
          const id = section.id ?? generateId();
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

      duplicateSection: (id) =>
        set((s) => {
          if (!s.resume) return;
          const section = s.resume.sections.find((sec) => sec.id === id);
          if (!section) return;
          const cloned = JSON.parse(JSON.stringify(section)) as ResumeSection;
          cloned.id = generateId();
          // bump nested item ids so we don't end up with duplicate React keys
          const data = cloned.data as any;
          if (Array.isArray(data.items)) {
            data.items = data.items.map((it: { id?: string }) => ({
              ...it,
              id: generateId(),
            }));
          }
          if (Array.isArray(data.groups)) {
            data.groups = data.groups.map((g: { id?: string }) => ({
              ...g,
              id: generateId(),
            }));
          }
          s.resume.sections.push(cloned);
          const idx = s.resume.layout.sectionsOrder.indexOf(id);
          if (idx === -1) s.resume.layout.sectionsOrder.push(cloned.id);
          else s.resume.layout.sectionsOrder.splice(idx + 1, 0, cloned.id);
          s.isDirty = true;
        }),

      addItemToSection: (sectionId, item) =>
        set((s) => {
          if (!s.resume) return;
          const section = s.resume.sections.find((sec) => sec.id === sectionId);
          if (!section) return;
          const data = section.data as any;
          if (Array.isArray(data.items)) data.items.push(item);
          else if (Array.isArray(data.groups)) data.groups.push(item);
          s.isDirty = true;
        }),

      updateItemInSection: (sectionId, itemId, patch) =>
        set((s) => {
          if (!s.resume) return;
          const section = s.resume.sections.find((sec) => sec.id === sectionId);
          if (!section) return;
          const data = section.data as any;
          const list = Array.isArray(data.items)
            ? data.items
            : Array.isArray(data.groups)
              ? data.groups
              : null;
          if (!list) return;
          const idx = list.findIndex((it: { id: string }) => it.id === itemId);
          if (idx === -1) return;
          Object.assign(list[idx], patch);
          s.isDirty = true;
        }),

      removeItemFromSection: (sectionId, itemId) =>
        set((s) => {
          if (!s.resume) return;
          const section = s.resume.sections.find((sec) => sec.id === sectionId);
          if (!section) return;
          const data = section.data as any;
          if (Array.isArray(data.items)) {
            data.items = data.items.filter((it: { id: string }) => it.id !== itemId);
          } else if (Array.isArray(data.groups)) {
            data.groups = data.groups.filter((g: { id: string }) => g.id !== itemId);
          }
          s.isDirty = true;
        }),

      reorderItemsInSection: (sectionId, fromIndex, toIndex) =>
        set((s) => {
          if (!s.resume) return;
          const section = s.resume.sections.find((sec) => sec.id === sectionId);
          if (!section) return;
          const data = section.data as any;
          const list = Array.isArray(data.items)
            ? data.items
            : Array.isArray(data.groups)
              ? data.groups
              : null;
          if (!list) return;
          const [moved] = list.splice(fromIndex, 1);
          list.splice(toIndex, 0, moved);
          s.isDirty = true;
        }),

      selectSection: (id) =>
        set((s) => {
          s.selectedSectionId = id;
          s.selectedItemId = null;
          if (id) s.activePanel = 'sections';
        }),

      selectItem: (id) =>
        set((s) => {
          s.selectedItemId = id;
        }),

      setActivePanel: (panel) =>
        set((s) => {
          s.activePanel = panel;
        }),

      setZoom: (zoom) =>
        set((s) => {
          s.zoom = Math.max(0.4, Math.min(2, zoom));
        }),

      setCurrentPage: (page) =>
        set((s) => {
          s.currentPage = Math.max(1, page);
        }),

      setPageCount: (count) =>
        set((s) => {
          s.pageCount = Math.max(1, count);
          if (s.currentPage > count) s.currentPage = count;
        }),
    })),
    {
      limit: 50,
      // Undo history only tracks the document — not zoom, selection, or panel state
      partialize: (state) => ({ resume: state.resume }),
      equality: (a, b) => JSON.stringify(a) === JSON.stringify(b),
    },
  ),
);

export const useResumeHistory = () => useStore(useResumeStore.temporal);
