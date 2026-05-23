'use client';

import { useResumeStore } from '@/store/resume.store';
import type { ResumeEducationSection, ResumeEducationItem } from '@devfolio/shared';
import {
  Field,
  TextInput,
  TwoCol,
  Toggle,
  BulletList,
  ItemCard,
  AddButton,
} from './primitives';
import { makeEducationItem } from '../../sectionDefaults';

interface Props {
  section: ResumeEducationSection;
}

export function EducationForm({ section }: Props) {
  const updateSectionData = useResumeStore((s) => s.updateSectionData);
  const updateItemInSection = useResumeStore((s) => s.updateItemInSection);
  const removeItemFromSection = useResumeStore((s) => s.removeItemFromSection);
  const addItemToSection = useResumeStore((s) => s.addItemToSection);

  const patch = (id: string, p: Partial<ResumeEducationItem>) =>
    updateItemInSection<ResumeEducationItem>(section.id, id, p);

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
            title={item.degree || 'New degree'}
            subtitle={item.institution}
            onRemove={() => removeItemFromSection(section.id, item.id)}
            defaultOpen={!item.institution && !item.degree}
          >
            <Field label="Institution">
              <TextInput
                value={item.institution}
                onChange={(v) => patch(item.id, { institution: v })}
                placeholder="Salahaddin University"
              />
            </Field>
            <TwoCol>
              <Field label="Degree">
                <TextInput
                  value={item.degree}
                  onChange={(v) => patch(item.id, { degree: v })}
                  placeholder="B.S."
                />
              </Field>
              <Field label="Field">
                <TextInput
                  value={item.field ?? ''}
                  onChange={(v) => patch(item.id, { field: v })}
                  placeholder="Computer Science"
                />
              </Field>
            </TwoCol>
            <TwoCol>
              <Field label="Start">
                <TextInput
                  value={item.startDate}
                  onChange={(v) => patch(item.id, { startDate: v })}
                  placeholder="2018-09"
                />
              </Field>
              <Field label="End">
                <TextInput
                  value={item.endDate ?? ''}
                  onChange={(v) => patch(item.id, { endDate: v })}
                  placeholder="2022-05"
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
              <Field label="GPA">
                <TextInput
                  value={item.gpa ?? ''}
                  onChange={(v) => patch(item.id, { gpa: v })}
                  placeholder="3.8 / 4.0"
                />
              </Field>
            </TwoCol>
            <Toggle
              checked={item.current}
              onChange={(v) => patch(item.id, { current: v })}
              label="Currently enrolled"
            />
            <Field label="Details (courses, honors, etc.)">
              <BulletList
                bullets={item.details}
                onChange={(next) => patch(item.id, { details: next })}
                placeholder="Dean's List..."
              />
            </Field>
          </ItemCard>
        ))}

        <AddButton
          label="Add degree"
          onClick={() => addItemToSection(section.id, makeEducationItem())}
        />
      </div>
    </div>
  );
}
