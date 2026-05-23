'use client';

import { useState } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useResumeStore } from '@/store/resume.store';
import { RESUME_SECTION_TYPES, type ResumeSectionType } from '@devfolio/shared';
import { RESUME_SECTION_META, makeSection } from '../sectionDefaults';

export function SectionsList() {
  const { resume, reorderSections, addSection, selectSection } = useResumeStore();
  const [adding, setAdding] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  if (!resume) return null;

  const orderedSections = resume.layout.sectionsOrder
    .map((id) => resume.sections.find((s) => s.id === id))
    .filter(Boolean) as typeof resume.sections;

  const existingTypes = new Set(resume.sections.map((s) => s.type));

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const fromIdx = resume.layout.sectionsOrder.indexOf(String(active.id));
    const toIdx = resume.layout.sectionsOrder.indexOf(String(over.id));
    if (fromIdx !== -1 && toIdx !== -1) reorderSections(fromIdx, toIdx);
  };

  const handleAddSection = (type: ResumeSectionType) => {
    addSection(makeSection(type));
    setAdding(false);
  };

  return (
    <div className="p-3 space-y-3">
      <div className="flex items-center justify-between px-1 pt-1 pb-1">
        <span className="text-[10px] uppercase tracking-[0.14em] text-slate-500 font-semibold">
          Sections · {orderedSections.length}
        </span>
        <span className="text-[10px] text-slate-600">Drag to reorder</span>
      </div>

      {orderedSections.length > 0 && (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext
            items={orderedSections.map((s) => s.id)}
            strategy={verticalListSortingStrategy}
          >
            <ul className="space-y-1">
              {orderedSections.map((section) => (
                <SortableRow
                  key={section.id}
                  id={section.id}
                  type={section.type}
                  visible={section.visible}
                  preview={previewFor(section)}
                  onSelect={() => selectSection(section.id)}
                />
              ))}
            </ul>
          </SortableContext>
        </DndContext>
      )}

      {adding ? (
        <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-2.5 space-y-2 shadow-lg">
          <div className="flex items-center justify-between px-1">
            <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-400">
              Add section
            </span>
            <button
              onClick={() => setAdding(false)}
              className="text-slate-600 hover:text-slate-300 text-xs w-5 h-5 rounded grid place-items-center"
            >
              ✕
            </button>
          </div>
          <div className="grid grid-cols-2 gap-1">
            {RESUME_SECTION_TYPES.map((type) => {
              const meta = RESUME_SECTION_META[type];
              const disabled = meta.once && existingTypes.has(type);
              return (
                <button
                  key={type}
                  onClick={() => handleAddSection(type)}
                  disabled={disabled}
                  className="flex items-center gap-2 px-2.5 py-2 rounded-md text-xs text-slate-300 hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed text-left transition-colors group"
                >
                  <span className="text-slate-500 group-hover:text-violet-300 w-3 text-center transition-colors">
                    {meta.icon}
                  </span>
                  <span>{meta.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      ) : (
        <button
          onClick={() => setAdding(true)}
          className="w-full text-sm text-slate-400 hover:text-violet-200 hover:bg-violet-500/5 border border-dashed border-slate-800 hover:border-violet-500/40 rounded-xl py-2.5 transition-colors flex items-center justify-center gap-1.5"
        >
          <span className="text-base leading-none">+</span> Add section
        </button>
      )}
    </div>
  );
}

interface SortableRowProps {
  id: string;
  type: string;
  visible: boolean;
  preview: string;
  onSelect: () => void;
}

function SortableRow({ id, type, visible, preview, onSelect }: SortableRowProps) {
  const { removeSection, updateSectionVisibility, duplicateSection } = useResumeStore();
  const selectedSectionId = useResumeStore((s) => s.selectedSectionId);
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id,
  });

  const meta = RESUME_SECTION_META[type as ResumeSectionType];
  const isSelected = selectedSectionId === id;

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.55 : visible ? 1 : 0.5,
    zIndex: isDragging ? 20 : 'auto',
  };

  return (
    <li
      ref={setNodeRef}
      style={style}
      className={`group flex items-center gap-2 rounded-lg pl-1.5 pr-2 py-2 transition-all border ${
        isSelected
          ? 'bg-violet-500/10 border-violet-500/40 shadow-[0_0_0_1px_rgba(167,139,250,0.2)_inset]'
          : 'border-transparent hover:bg-slate-900/70 hover:border-slate-800'
      } ${isDragging ? 'shadow-lg ring-1 ring-violet-500/30' : ''}`}
    >
      <button
        {...attributes}
        {...listeners}
        className="text-slate-600 hover:text-slate-300 cursor-grab active:cursor-grabbing select-none px-1 py-1 -my-1"
        title="Drag to reorder"
        aria-label="Drag handle"
      >
        <svg width="10" height="14" viewBox="0 0 10 14" fill="currentColor">
          <circle cx="2" cy="2" r="1" />
          <circle cx="8" cy="2" r="1" />
          <circle cx="2" cy="7" r="1" />
          <circle cx="8" cy="7" r="1" />
          <circle cx="2" cy="12" r="1" />
          <circle cx="8" cy="12" r="1" />
        </svg>
      </button>

      <span
        className={`w-5 h-5 rounded text-center text-xs grid place-items-center shrink-0 ${
          isSelected
            ? 'bg-violet-500/20 text-violet-200'
            : 'text-slate-500 group-hover:text-slate-400'
        }`}
      >
        {meta?.icon ?? '◦'}
      </span>

      <button
        onClick={onSelect}
        className="flex-1 text-left min-w-0"
      >
        <div className="text-sm text-slate-100 truncate font-medium">{meta?.label ?? type}</div>
        {preview && (
          <div className="text-[11px] text-slate-500 truncate mt-0.5">{preview}</div>
        )}
      </button>

      <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity">
        <IconButton
          onClick={() => updateSectionVisibility(id, !visible)}
          title={visible ? 'Hide on resume' : 'Show on resume'}
        >
          {visible ? (
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8Z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
          ) : (
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
              <line x1="1" y1="1" x2="23" y2="23" />
            </svg>
          )}
        </IconButton>
        <IconButton onClick={() => duplicateSection(id)} title="Duplicate">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
          </svg>
        </IconButton>
        <IconButton
          onClick={() => {
            if (window.confirm('Delete this section?')) removeSection(id);
          }}
          title="Delete"
          danger
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="3 6 5 6 21 6" />
            <path d="M19 6l-2 14a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2L5 6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
          </svg>
        </IconButton>
      </div>
    </li>
  );
}

function IconButton({
  children,
  onClick,
  title,
  danger,
}: {
  children: React.ReactNode;
  onClick: () => void;
  title: string;
  danger?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      title={title}
      className={`w-6 h-6 rounded grid place-items-center transition-colors ${
        danger
          ? 'text-slate-500 hover:text-red-400 hover:bg-red-500/10'
          : 'text-slate-500 hover:text-slate-200 hover:bg-slate-700/60'
      }`}
    >
      {children}
    </button>
  );
}

function previewFor(section: { type: string; data: unknown }): string {
  const d = section.data as Record<string, unknown>;
  switch (section.type) {
    case 'header':
      return typeof d.name === 'string' && d.name ? d.name : '';
    case 'summary':
      return typeof d.body === 'string' && d.body
        ? d.body.slice(0, 60) + (d.body.length > 60 ? '…' : '')
        : 'Empty';
    case 'experience':
    case 'education':
    case 'projects':
    case 'certifications':
    case 'awards':
    case 'languages':
    case 'custom': {
      const items = Array.isArray(d.items) ? d.items : [];
      return items.length === 0 ? 'Empty' : `${items.length} item${items.length === 1 ? '' : 's'}`;
    }
    case 'skills': {
      const groups = Array.isArray(d.groups) ? d.groups : [];
      const skillCount = groups.reduce(
        (acc: number, g: unknown) => acc + (Array.isArray((g as { items?: unknown[] }).items) ? (g as { items: unknown[] }).items.length : 0),
        0,
      );
      return groups.length === 0
        ? 'Empty'
        : `${groups.length} categor${groups.length === 1 ? 'y' : 'ies'} · ${skillCount} skill${skillCount === 1 ? '' : 's'}`;
    }
    default:
      return '';
  }
}
