'use client';

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
import { useEditorStore } from '@/store/editor.store';
import { SECTION_TYPES, type SectionType } from '@devfolio/shared';
import { generateId } from '@/lib/utils';

const SECTION_DEFAULTS: Record<SectionType, unknown> = {
  hero: {
    type: 'hero',
    visible: true,
    data: { name: 'Your Name', title: 'Your Title', availableForWork: false },
  },
  about: {
    type: 'about',
    visible: true,
    data: { heading: 'About Me', bio: 'Tell your story here...' },
  },
  projects: {
    type: 'projects',
    visible: true,
    data: { heading: 'Projects', items: [], layout: 'grid', showFeaturedOnly: false },
  },
  skills: {
    type: 'skills',
    visible: true,
    data: { heading: 'Skills', items: [], layout: 'tags', showLevels: false },
  },
  experience: {
    type: 'experience',
    visible: true,
    data: { heading: 'Experience', items: [], layout: 'timeline' },
  },
  education: {
    type: 'education',
    visible: true,
    data: { heading: 'Education', items: [] },
  },
  contact: {
    type: 'contact',
    visible: true,
    data: { heading: 'Get In Touch', socials: {}, showContactForm: true },
  },
};

const SECTION_ICONS: Record<SectionType, string> = {
  hero: '👋',
  about: '👤',
  projects: '🚀',
  skills: '⚡',
  experience: '💼',
  education: '🎓',
  contact: '✉️',
};

export function SectionList() {
  const { portfolio, reorderSections, addSection, selectSection } = useEditorStore();
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  if (!portfolio) return null;

  const orderedSections = portfolio.layout.sectionsOrder
    .map((id) => portfolio.sections.find((s) => s.id === id))
    .filter(Boolean) as typeof portfolio.sections;

  const existingTypes = new Set(portfolio.sections.map((s) => s.type));

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const fromIdx = portfolio.layout.sectionsOrder.indexOf(String(active.id));
    const toIdx = portfolio.layout.sectionsOrder.indexOf(String(over.id));
    if (fromIdx !== -1 && toIdx !== -1) {
      reorderSections(fromIdx, toIdx);
    }
  };

  const handleAddSection = (type: SectionType) => {
    const defaults = SECTION_DEFAULTS[type] as {
      type: SectionType;
      visible: boolean;
      data: unknown;
    };
    addSection({ ...defaults, id: generateId() } as Parameters<typeof addSection>[0]);
  };

  return (
    <div className="p-3 space-y-4">
      {/* Existing sections (drag & drop) */}
      {orderedSections.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 px-1">
            Active Sections
          </p>
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={orderedSections.map((s) => s.id)} strategy={verticalListSortingStrategy}>
              {orderedSections.map((section) => (
                <SortableSectionRow
                  key={section.id}
                  section={section}
                  onSelect={() => selectSection(section.id)}
                />
              ))}
            </SortableContext>
          </DndContext>
        </div>
      )}

      {/* Add section */}
      <div>
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 px-1">
          Add Section
        </p>
        <div className="grid grid-cols-2 gap-1.5">
          {SECTION_TYPES.map((type) => (
            <button
              key={type}
              onClick={() => handleAddSection(type)}
              disabled={type === 'hero' && existingTypes.has('hero')}
              className="flex items-center gap-2 p-2.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed border border-slate-700 hover:border-violet-700 rounded-lg text-left transition-colors text-xs"
            >
              <span>{SECTION_ICONS[type]}</span>
              <span className="text-slate-300 capitalize">{type}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

interface SortableRowProps {
  section: { id: string; type: string; visible: boolean };
  onSelect: () => void;
}

function SortableSectionRow({ section, onSelect }: SortableRowProps) {
  const { removeSection, updateSectionVisibility } = useEditorStore();
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: section.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const icon = SECTION_ICONS[section.type as SectionType] ?? '📄';

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center gap-2 p-2.5 bg-slate-800 border border-slate-700 hover:border-slate-600 rounded-lg group mb-1.5"
    >
      <button
        {...attributes}
        {...listeners}
        className="text-slate-600 hover:text-slate-400 cursor-grab active:cursor-grabbing"
        title="Drag to reorder"
      >
        ⠿
      </button>

      <span className="text-sm">{icon}</span>

      <button
        onClick={onSelect}
        className="flex-1 text-left text-sm text-slate-300 hover:text-white transition-colors capitalize"
      >
        {section.type}
      </button>

      <button
        onClick={() => updateSectionVisibility(section.id, !section.visible)}
        title={section.visible ? 'Hide section' : 'Show section'}
        className="text-slate-600 hover:text-slate-400 text-xs opacity-0 group-hover:opacity-100 transition-opacity"
      >
        {section.visible ? '👁' : '🚫'}
      </button>

      <button
        onClick={() => removeSection(section.id)}
        title="Remove section"
        className="text-slate-700 hover:text-red-500 text-xs opacity-0 group-hover:opacity-100 transition-opacity"
      >
        ✕
      </button>
    </div>
  );
}
