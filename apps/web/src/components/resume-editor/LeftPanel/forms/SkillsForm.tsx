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
import { useResumeStore } from '@/store/resume.store';
import {
  RESUME_SKILL_LAYOUTS,
  type ResumeSkillsSection,
  type ResumeSkillGroup,
  type ResumeSkillLayout,
} from '@devfolio/shared';
import { Field, TextInput, ChipInput, AddButton } from './primitives';
import { makeSkillGroup } from '../../sectionDefaults';

interface Props {
  section: ResumeSkillsSection;
}

const LAYOUT_META: Record<
  ResumeSkillLayout,
  { label: string; preview: string; hint: string }
> = {
  grouped: { label: 'Grouped', preview: 'Cat. | items', hint: 'Category aligned left, comma-separated skills.' },
  tags: { label: 'Tags', preview: 'pill pill pill', hint: 'Bordered chips, grouped under each category.' },
  bars: { label: 'Bars', preview: 'name ──', hint: 'Skill name with a level bar.' },
  compact: { label: 'Compact', preview: 'all · in · line', hint: 'Most space-efficient — one inline run.' },
  grid: { label: 'Grid', preview: '◫ ◫', hint: 'Two-column grid of small cards.' },
  minimal: { label: 'ATS-safe', preview: 'Cat: a, b, c', hint: 'Pure text — best for ATS parsers.' },
};

export function SkillsForm({ section }: Props) {
  const updateSectionData = useResumeStore((s) => s.updateSectionData);
  const updateItemInSection = useResumeStore((s) => s.updateItemInSection);
  const removeItemFromSection = useResumeStore((s) => s.removeItemFromSection);
  const addItemToSection = useResumeStore((s) => s.addItemToSection);
  const reorderItemsInSection = useResumeStore((s) => s.reorderItemsInSection);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const patch = (id: string, p: Partial<ResumeSkillGroup>) =>
    updateItemInSection<ResumeSkillGroup>(section.id, id, p);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const ids = section.data.groups.map((g) => g.id);
    const from = ids.indexOf(String(active.id));
    const to = ids.indexOf(String(over.id));
    if (from !== -1 && to !== -1) reorderItemsInSection(section.id, from, to);
  };

  return (
    <div className="space-y-5">
      <Field label="Heading">
        <TextInput
          value={section.data.heading}
          onChange={(v) => updateSectionData(section.id, { heading: v })}
        />
      </Field>

      <Field label="Layout" hint={LAYOUT_META[section.data.layout].hint}>
        <div className="grid grid-cols-3 gap-1.5">
          {RESUME_SKILL_LAYOUTS.map((opt) => {
            const meta = LAYOUT_META[opt];
            const selected = section.data.layout === opt;
            return (
              <button
                key={opt}
                onClick={() => updateSectionData(section.id, { layout: opt })}
                className={`group relative px-2 py-2 rounded-lg text-[11px] border transition-all ${
                  selected
                    ? 'bg-violet-500/15 border-violet-500/60 text-violet-100 shadow-sm shadow-violet-500/10'
                    : 'bg-slate-800/50 border-slate-800 text-slate-400 hover:border-slate-700 hover:bg-slate-800'
                }`}
              >
                <div className="font-medium capitalize">{meta.label}</div>
                <div
                  className={`mt-1 font-mono text-[9px] ${
                    selected ? 'text-violet-300/80' : 'text-slate-600 group-hover:text-slate-500'
                  }`}
                >
                  {meta.preview}
                </div>
              </button>
            );
          })}
        </div>
      </Field>

      {section.data.layout === 'bars' && (
        <label className="flex items-start gap-2.5 px-3 py-2.5 rounded-lg bg-slate-900/60 border border-slate-800 cursor-pointer">
          <input
            type="checkbox"
            checked={section.data.showLevels}
            onChange={(e) => updateSectionData(section.id, { showLevels: e.target.checked })}
            className="mt-0.5 accent-violet-500"
          />
          <div className="flex-1">
            <div className="text-xs text-slate-200">Vary bar widths</div>
            <div className="text-[10px] text-slate-500 mt-0.5">
              First items get fuller bars. Off = uniform bars.
            </div>
          </div>
        </label>
      )}

      <div className="pt-2 space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-[11px] uppercase tracking-wider text-slate-500 font-semibold">
            Categories
          </span>
          <span className="text-[10px] text-slate-600">{section.data.groups.length} total</span>
        </div>

        {section.data.groups.length > 0 && (
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext
              items={section.data.groups.map((g) => g.id)}
              strategy={verticalListSortingStrategy}
            >
              <div className="space-y-2">
                {section.data.groups.map((group) => (
                  <SortableGroupCard
                    key={group.id}
                    group={group}
                    onPatch={(p) => patch(group.id, p)}
                    onRemove={() => removeItemFromSection(section.id, group.id)}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        )}

        <AddButton
          label="Add category"
          onClick={() => addItemToSection(section.id, makeSkillGroup())}
        />
      </div>
    </div>
  );
}

interface SortableGroupCardProps {
  group: ResumeSkillGroup;
  onPatch: (p: Partial<ResumeSkillGroup>) => void;
  onRemove: () => void;
}

function SortableGroupCard({ group, onPatch, onRemove }: SortableGroupCardProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: group.id,
  });
  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.55 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="rounded-lg border border-slate-800 bg-slate-900/60 overflow-hidden"
    >
      <div className="flex items-center gap-1.5 px-2 py-1.5 border-b border-slate-800/80 bg-slate-900/40">
        <button
          {...attributes}
          {...listeners}
          className="text-slate-600 hover:text-slate-300 cursor-grab active:cursor-grabbing text-xs px-1 py-0.5"
          title="Drag to reorder"
          aria-label="Drag handle"
        >
          ⋮⋮
        </button>
        <input
          value={group.category}
          onChange={(e) => onPatch({ category: e.target.value })}
          placeholder="Category name"
          className="flex-1 bg-transparent text-sm font-medium text-slate-100 px-1 py-0.5 focus:outline-none placeholder:text-slate-600"
        />
        <span className="text-[10px] text-slate-600 px-1 select-none">
          {group.items.length}
        </span>
        <button
          onClick={() => {
            if (window.confirm('Remove this category?')) onRemove();
          }}
          className="text-slate-500 hover:text-red-400 text-xs w-6 h-6 rounded grid place-items-center transition-colors"
          title="Remove category"
          aria-label="Remove"
        >
          ✕
        </button>
      </div>
      <div className="p-2">
        <ChipInput
          values={group.items}
          onChange={(next) => onPatch({ items: next })}
          placeholder="TypeScript, Go, Python…"
        />
      </div>
    </div>
  );
}
