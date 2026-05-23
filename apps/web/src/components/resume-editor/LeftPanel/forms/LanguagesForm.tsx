'use client';

import { useResumeStore } from '@/store/resume.store';
import type { ResumeLanguagesSection, ResumeLanguageItem } from '@devfolio/shared';
import { Field, TextInput, ItemCard, AddButton } from './primitives';
import { makeLanguageItem } from '../../sectionDefaults';

const PROFICIENCY: ResumeLanguageItem['proficiency'][] = [
  'elementary',
  'limited',
  'professional',
  'full',
  'native',
];

interface Props {
  section: ResumeLanguagesSection;
}

export function LanguagesForm({ section }: Props) {
  const updateSectionData = useResumeStore((s) => s.updateSectionData);
  const updateItemInSection = useResumeStore((s) => s.updateItemInSection);
  const removeItemFromSection = useResumeStore((s) => s.removeItemFromSection);
  const addItemToSection = useResumeStore((s) => s.addItemToSection);

  const patch = (id: string, p: Partial<ResumeLanguageItem>) =>
    updateItemInSection<ResumeLanguageItem>(section.id, id, p);

  return (
    <div className="space-y-4">
      <Field label="Heading">
        <TextInput
          value={section.data.heading}
          onChange={(v) => updateSectionData(section.id, { heading: v })}
        />
      </Field>

      <div className="space-y-2">
        {section.data.items.map((item) => (
          <ItemCard
            key={item.id}
            title={item.name || 'New language'}
            subtitle={item.proficiency}
            onRemove={() => removeItemFromSection(section.id, item.id)}
            defaultOpen={!item.name}
          >
            <Field label="Language">
              <TextInput
                value={item.name}
                onChange={(v) => patch(item.id, { name: v })}
                placeholder="English"
              />
            </Field>
            <Field label="Proficiency">
              <select
                value={item.proficiency}
                onChange={(e) =>
                  patch(item.id, {
                    proficiency: e.target.value as ResumeLanguageItem['proficiency'],
                  })
                }
                className="w-full bg-slate-800/70 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-violet-500"
              >
                {PROFICIENCY.map((p) => (
                  <option key={p} value={p} className="capitalize">
                    {p}
                  </option>
                ))}
              </select>
            </Field>
          </ItemCard>
        ))}

        <AddButton
          label="Add language"
          onClick={() => addItemToSection(section.id, makeLanguageItem())}
        />
      </div>
    </div>
  );
}
