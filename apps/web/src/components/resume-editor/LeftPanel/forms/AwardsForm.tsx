'use client';

import { useResumeStore } from '@/store/resume.store';
import type { ResumeAwardsSection, ResumeAwardItem } from '@devfolio/shared';
import { Field, TextInput, RichEditField, ItemCard, AddButton } from './primitives';
import { makeAwardItem } from '../../sectionDefaults';

interface Props {
  section: ResumeAwardsSection;
}

export function AwardsForm({ section }: Props) {
  const updateSectionData = useResumeStore((s) => s.updateSectionData);
  const updateItemInSection = useResumeStore((s) => s.updateItemInSection);
  const removeItemFromSection = useResumeStore((s) => s.removeItemFromSection);
  const addItemToSection = useResumeStore((s) => s.addItemToSection);

  const patch = (id: string, p: Partial<ResumeAwardItem>) =>
    updateItemInSection<ResumeAwardItem>(section.id, id, p);

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
            title={item.name || 'New award'}
            subtitle={item.issuer}
            onRemove={() => removeItemFromSection(section.id, item.id)}
            defaultOpen={!item.name}
          >
            <Field label="Name">
              <TextInput
                value={item.name}
                onChange={(v) => patch(item.id, { name: v })}
              />
            </Field>
            <Field label="Issuer">
              <TextInput
                value={item.issuer ?? ''}
                onChange={(v) => patch(item.id, { issuer: v })}
              />
            </Field>
            <Field label="Date">
              <TextInput
                value={item.date ?? ''}
                onChange={(v) => patch(item.id, { date: v })}
                placeholder="2024-09"
              />
            </Field>
            <Field label="Description (optional)">
              <RichEditField
                value={item.description ?? ''}
                onChange={(v) => patch(item.id, { description: v })}
                label={`${item.name || 'Award'} — Description`}
                emptyHint="Click to describe the award"
              />
            </Field>
          </ItemCard>
        ))}

        <AddButton
          label="Add award"
          onClick={() => addItemToSection(section.id, makeAwardItem())}
        />
      </div>
    </div>
  );
}
