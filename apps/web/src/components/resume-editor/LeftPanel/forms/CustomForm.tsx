'use client';

import { useResumeStore } from '@/store/resume.store';
import type { ResumeCustomSection, ResumeCustomItem } from '@devfolio/shared';
import {
  Field,
  TextInput,
  RichEditField,
  TwoCol,
  BulletList,
  ItemCard,
  AddButton,
} from './primitives';
import { makeCustomItem } from '../../sectionDefaults';

interface Props {
  section: ResumeCustomSection;
}

export function CustomForm({ section }: Props) {
  const updateSectionData = useResumeStore((s) => s.updateSectionData);
  const updateItemInSection = useResumeStore((s) => s.updateItemInSection);
  const removeItemFromSection = useResumeStore((s) => s.removeItemFromSection);
  const addItemToSection = useResumeStore((s) => s.addItemToSection);

  const patch = (id: string, p: Partial<ResumeCustomItem>) =>
    updateItemInSection<ResumeCustomItem>(section.id, id, p);

  return (
    <div className="space-y-4">
      <Field label="Section heading">
        <TextInput
          value={section.data.heading}
          onChange={(v) => updateSectionData(section.id, { heading: v })}
          placeholder="Publications, Volunteer Work..."
        />
      </Field>

      <div className="space-y-2">
        {section.data.items.map((item) => (
          <ItemCard
            key={item.id}
            title={item.title || 'New entry'}
            subtitle={item.subtitle}
            onRemove={() => removeItemFromSection(section.id, item.id)}
            defaultOpen={!item.title}
          >
            <Field label="Title">
              <TextInput
                value={item.title}
                onChange={(v) => patch(item.id, { title: v })}
              />
            </Field>
            <TwoCol>
              <Field label="Subtitle">
                <TextInput
                  value={item.subtitle ?? ''}
                  onChange={(v) => patch(item.id, { subtitle: v })}
                />
              </Field>
              <Field label="Date">
                <TextInput
                  value={item.date ?? ''}
                  onChange={(v) => patch(item.id, { date: v })}
                />
              </Field>
            </TwoCol>
            <TwoCol>
              <Field label="Location">
                <TextInput
                  value={item.location ?? ''}
                  onChange={(v) => patch(item.id, { location: v })}
                />
              </Field>
              <Field label="URL">
                <TextInput
                  value={item.url ?? ''}
                  onChange={(v) => patch(item.id, { url: v })}
                />
              </Field>
            </TwoCol>
            <Field label="Description">
              <RichEditField
                value={item.description ?? ''}
                onChange={(v) => patch(item.id, { description: v })}
                label={`${item.title || 'Entry'} — Description`}
                emptyHint="Click to add a description"
              />
            </Field>
            <Field label="Bullets">
              <BulletList
                bullets={item.bullets}
                onChange={(next) => patch(item.id, { bullets: next })}
              />
            </Field>
          </ItemCard>
        ))}

        <AddButton
          label="Add entry"
          onClick={() => addItemToSection(section.id, makeCustomItem())}
        />
      </div>
    </div>
  );
}
