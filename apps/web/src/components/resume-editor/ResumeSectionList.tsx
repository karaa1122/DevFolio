'use client';

import { useState } from 'react';
import { useResumeStore } from '@/store/resume.store';
import { RESUME_SECTION_TYPES, type ResumeSectionType } from '@devfolio/shared';
import { generateId } from '@/lib/utils';
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
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { ResumeSectionEditor } from './ResumeSectionEditor';

const SECTION_META: Record<ResumeSectionType, { label: string; icon: string }> = {
  contact:       { label: 'Contact',        icon: '👤' },
  summary:       { label: 'Profile',        icon: '📝' },
  experience:    { label: 'Experience',     icon: '💼' },
  education:     { label: 'Education',      icon: '🎓' },
  skills:        { label: 'Skills',         icon: '⚡' },
  projects:      { label: 'Projects',       icon: '🚀' },
  certifications:{ label: 'Certifications', icon: '🏆' },
};

const SINGLETON_TYPES: ResumeSectionType[] = ['contact', 'summary'];

const defaultData: Record<ResumeSectionType, object> = {
  contact:       { name: '', title: '', email: '', phone: '', location: '', linkedin: '', github: '' },
  summary:       { heading: 'Profile', text: '' },
  experience:    { heading: 'Experience', items: [] },
  education:     { heading: 'Education', items: [] },
  skills:        { heading: 'Skills', items: [] },
  projects:      { heading: 'Projects', items: [] },
  certifications:{ heading: 'Certifications', items: [] },
};

// ─── Drag handle icon ─────────────────────────────────────────────────────────

function DragHandle({ listeners }: { listeners: Record<string, unknown> | undefined }) {
  return (
    <div
      {...listeners}
      className="flex flex-col items-center justify-center w-5 h-8 cursor-grab active:cursor-grabbing text-slate-400 hover:text-slate-600 touch-none shrink-0"
      title="Drag to reorder"
    >
      <svg width="10" height="16" viewBox="0 0 10 16" fill="currentColor">
        <circle cx="3" cy="3" r="1.5" /><circle cx="7" cy="3" r="1.5" />
        <circle cx="3" cy="8" r="1.5" /><circle cx="7" cy="8" r="1.5" />
        <circle cx="3" cy="13" r="1.5" /><circle cx="7" cy="13" r="1.5" />
      </svg>
    </div>
  );
}

// ─── Sortable section card ────────────────────────────────────────────────────

interface SortableSectionCardProps {
  sectionId: string;
  sectionType: ResumeSectionType;
  visible: boolean;
  isExpanded: boolean;
  itemCount: number;
  onToggleExpand: () => void;
  onToggleVisible: () => void;
  onRemove: () => void;
  canRemove: boolean;
}

function SortableSectionCard({
  sectionId,
  sectionType,
  visible,
  isExpanded,
  itemCount,
  onToggleExpand,
  onToggleVisible,
  onRemove,
  canRemove,
}: SortableSectionCardProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: sectionId });
  const { label, icon } = SECTION_META[sectionType] ?? { label: sectionType, icon: '📄' };

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.4 : 1 }}
      className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm"
    >
      {/* Header row */}
      <div
        className={`flex items-center gap-2 px-3 py-2.5 cursor-pointer select-none transition-colors ${
          isExpanded ? 'bg-slate-50' : 'hover:bg-slate-50'
        }`}
        onClick={onToggleExpand}
        {...attributes}
      >
        <DragHandle listeners={listeners as Record<string, unknown> | undefined} />

        <span className="text-base w-6 text-center shrink-0">{icon}</span>

        <div className="flex-1 min-w-0">
          <div className={`text-sm font-semibold truncate ${visible ? 'text-slate-800' : 'text-slate-400 line-through'}`}>
            {label}
          </div>
          {!isExpanded && itemCount > 0 && (
            <div className="text-xs text-slate-400 mt-0.5">{itemCount} {itemCount === 1 ? 'entry' : 'entries'}</div>
          )}
        </div>

        {/* Visibility toggle */}
        <button
          onClick={(e) => { e.stopPropagation(); onToggleVisible(); }}
          className={`p-1 rounded transition-colors ${visible ? 'text-slate-400 hover:text-slate-700' : 'text-slate-300 hover:text-slate-500'}`}
          title={visible ? 'Hide section' : 'Show section'}
        >
          {visible ? (
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
          ) : (
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
            </svg>
          )}
        </button>

        {/* Remove button */}
        {canRemove && (
          <button
            onClick={(e) => { e.stopPropagation(); onRemove(); }}
            className="p-1 rounded text-slate-300 hover:text-red-500 transition-colors"
            title="Remove section"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}

        {/* Expand chevron */}
        <svg
          className={`w-4 h-4 text-slate-400 transition-transform duration-200 shrink-0 ${isExpanded ? 'rotate-180' : ''}`}
          fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </div>

      {/* Expanded form */}
      {isExpanded && (
        <div className="border-t border-slate-100 bg-white">
          <ResumeSectionEditor sectionId={sectionId} />
        </div>
      )}
    </div>
  );
}

// ─── Add section drawer ───────────────────────────────────────────────────────

function AddSectionPanel({ existingTypes }: { existingTypes: Set<string> }) {
  const { addSection } = useResumeStore();
  const [open, setOpen] = useState(false);

  const available = RESUME_SECTION_TYPES.filter(
    t => t !== 'contact' && !(SINGLETON_TYPES.includes(t) && existingTypes.has(t))
  );

  return (
    <div className="mt-2">
      <button
        onClick={() => setOpen(v => !v)}
        className="w-full py-2.5 border-2 border-dashed border-slate-200 rounded-xl text-sm font-medium text-slate-400 hover:text-violet-600 hover:border-violet-300 transition-all flex items-center justify-center gap-2"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
        </svg>
        Add Section
      </button>

      {open && (
        <div className="mt-2 bg-white border border-slate-200 rounded-xl p-3 shadow-lg grid grid-cols-2 gap-2">
          {available.map(type => {
            const { label, icon } = SECTION_META[type] ?? { label: type, icon: '📄' };
            return (
              <button
                key={type}
                onClick={() => {
                  addSection({ id: generateId(), type, visible: true, data: defaultData[type] } as Parameters<typeof addSection>[0]);
                  setOpen(false);
                }}
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-slate-600 hover:bg-violet-50 hover:text-violet-700 transition-colors text-left"
              >
                <span>{icon}</span>
                <span className="font-medium">{label}</span>
              </button>
            );
          })}
          {available.length === 0 && (
            <p className="col-span-2 text-xs text-slate-400 text-center py-2">All sections added</p>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Main section list ────────────────────────────────────────────────────────

export function ResumeSectionList() {
  const {
    resume,
    selectedSectionId,
    selectSection,
    removeSection,
    updateSectionVisibility,
    reorderSections,
  } = useResumeStore();

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  if (!resume) return null;

  const order = resume.layout.sectionsOrder;
  const ordered = order
    .map(id => resume.sections.find(s => s.id === id))
    .filter((s): s is NonNullable<typeof s> => s !== undefined)
    .filter(s => s.type !== 'contact'); // contact is in Personal Details above

  const existingTypes = new Set(resume.sections.map(s => s.type));
  const sortableIds = ordered.map(s => s.id);

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIdx = order.indexOf(active.id as string);
    const newIdx = order.indexOf(over.id as string);
    if (oldIdx !== -1 && newIdx !== -1) reorderSections(oldIdx, newIdx);
  }

  function getItemCount(section: (typeof ordered)[0]): number {
    const d = section.data as Record<string, unknown>;
    if (Array.isArray(d.items)) return d.items.length;
    return 0;
  }

  return (
    <div className="space-y-2">
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={sortableIds} strategy={verticalListSortingStrategy}>
          {ordered.map(section => (
            <SortableSectionCard
              key={section.id}
              sectionId={section.id}
              sectionType={section.type as ResumeSectionType}
              visible={section.visible}
              isExpanded={selectedSectionId === section.id}
              itemCount={getItemCount(section)}
              onToggleExpand={() => selectSection(selectedSectionId === section.id ? null : section.id)}
              onToggleVisible={() => updateSectionVisibility(section.id, !section.visible)}
              onRemove={() => { if (selectedSectionId === section.id) selectSection(null); removeSection(section.id); }}
              canRemove={!SINGLETON_TYPES.includes(section.type as ResumeSectionType)}
            />
          ))}
        </SortableContext>
      </DndContext>

      <AddSectionPanel existingTypes={existingTypes} />
    </div>
  );
}
