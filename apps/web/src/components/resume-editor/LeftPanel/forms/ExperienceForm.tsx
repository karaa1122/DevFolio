'use client';

import { useResumeStore } from '@/store/resume.store';
import type { ResumeExperienceSection, ResumeExperienceItem } from '@devfolio/shared';
import {
  Field,
  TextInput,
  RichEditField,
  TwoCol,
  Toggle,
  BulletList,
  ChipInput,
  ItemCard,
  AddButton,
} from './primitives';
import { makeExperienceItem } from '../../sectionDefaults';

interface Props {
  section: ResumeExperienceSection;
}

export function ExperienceForm({ section }: Props) {
  const updateSectionData = useResumeStore((s) => s.updateSectionData);
  const updateItemInSection = useResumeStore((s) => s.updateItemInSection);
  const removeItemFromSection = useResumeStore((s) => s.removeItemFromSection);
  const addItemToSection = useResumeStore((s) => s.addItemToSection);

  const patchItem = (id: string, p: Partial<ResumeExperienceItem>) =>
    updateItemInSection<ResumeExperienceItem>(section.id, id, p);

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
            title={item.role || 'New role'}
            subtitle={item.company || 'Company'}
            onRemove={() => removeItemFromSection(section.id, item.id)}
            defaultOpen={!item.company && !item.role}
          >
            <TwoCol>
              <Field label="Role">
                <TextInput
                  value={item.role}
                  onChange={(v) => patchItem(item.id, { role: v })}
                  placeholder="Senior Engineer"
                />
              </Field>
              <Field label="Company">
                <TextInput
                  value={item.company}
                  onChange={(v) => patchItem(item.id, { company: v })}
                  placeholder="Google"
                />
              </Field>
            </TwoCol>
            <Field label="Location">
              <TextInput
                value={item.location ?? ''}
                onChange={(v) => patchItem(item.id, { location: v })}
                placeholder="Remote / San Francisco"
              />
            </Field>
            <TwoCol>
              <Field label="Start">
                <TextInput
                  value={item.startDate}
                  onChange={(v) => patchItem(item.id, { startDate: v })}
                  placeholder="2023-01"
                />
              </Field>
              <Field label="End">
                <TextInput
                  value={item.endDate ?? ''}
                  onChange={(v) => patchItem(item.id, { endDate: v })}
                  placeholder="2025-04"
                />
              </Field>
            </TwoCol>
            <Toggle
              checked={item.current}
              onChange={(v) => patchItem(item.id, { current: v })}
              label="Currently working here"
            />
            <Field label="Summary (optional)">
              <RichEditField
                value={item.summary ?? ''}
                onChange={(v) => patchItem(item.id, { summary: v })}
                label={`${item.role || 'Role'} — Summary`}
                placeholder="One-line role context"
                emptyHint="Click to add a role summary"
              />
            </Field>
            <Field label="Bullet points">
              <BulletList
                bullets={item.bullets}
                onChange={(next) => patchItem(item.id, { bullets: next })}
                placeholder="Shipped X, cut Y latency by Z%..."
              />
            </Field>
            <Field label="Technologies">
              <ChipInput
                values={item.technologies}
                onChange={(next) => patchItem(item.id, { technologies: next })}
                placeholder="TypeScript, Postgres..."
              />
            </Field>
          </ItemCard>
        ))}

        <AddButton
          label="Add role"
          onClick={() => addItemToSection(section.id, makeExperienceItem())}
        />
      </div>
    </div>
  );
}
