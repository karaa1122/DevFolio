'use client';

import { useResumeStore } from '@/store/resume.store';
import type { ResumeProjectsSection, ResumeProjectItem } from '@devfolio/shared';
import {
  Field,
  TextInput,
  TwoCol,
  BulletList,
  ChipInput,
  ItemCard,
  AddButton,
} from './primitives';
import { makeProjectItem } from '../../sectionDefaults';

interface Props {
  section: ResumeProjectsSection;
}

export function ProjectsForm({ section }: Props) {
  const updateSectionData = useResumeStore((s) => s.updateSectionData);
  const updateItemInSection = useResumeStore((s) => s.updateItemInSection);
  const removeItemFromSection = useResumeStore((s) => s.removeItemFromSection);
  const addItemToSection = useResumeStore((s) => s.addItemToSection);

  const patch = (id: string, p: Partial<ResumeProjectItem>) =>
    updateItemInSection<ResumeProjectItem>(section.id, id, p);

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
            title={item.name || 'New project'}
            subtitle={item.description}
            onRemove={() => removeItemFromSection(section.id, item.id)}
            defaultOpen={!item.name}
          >
            <Field label="Name">
              <TextInput
                value={item.name}
                onChange={(v) => patch(item.id, { name: v })}
                placeholder="DevFolio"
              />
            </Field>
            <Field label="Tagline">
              <TextInput
                value={item.description ?? ''}
                onChange={(v) => patch(item.id, { description: v })}
                placeholder="One-line pitch"
              />
            </Field>
            <TwoCol>
              <Field label="Live URL">
                <TextInput
                  value={item.url ?? ''}
                  onChange={(v) => patch(item.id, { url: v })}
                  placeholder="https://..."
                />
              </Field>
              <Field label="Repo URL">
                <TextInput
                  value={item.repoUrl ?? ''}
                  onChange={(v) => patch(item.id, { repoUrl: v })}
                  placeholder="github.com/..."
                />
              </Field>
            </TwoCol>
            <Field label="Year">
              <TextInput
                value={item.year ? String(item.year) : ''}
                onChange={(v) => {
                  const n = parseInt(v, 10);
                  patch(item.id, { year: Number.isFinite(n) ? n : undefined });
                }}
                placeholder="2025"
              />
            </Field>
            <Field label="Bullets">
              <BulletList
                bullets={item.bullets}
                onChange={(next) => patch(item.id, { bullets: next })}
                placeholder="Impact / outcome..."
              />
            </Field>
            <Field label="Technologies">
              <ChipInput
                values={item.technologies}
                onChange={(next) => patch(item.id, { technologies: next })}
                placeholder="React, Postgres..."
              />
            </Field>
          </ItemCard>
        ))}

        <AddButton
          label="Add project"
          onClick={() => addItemToSection(section.id, makeProjectItem())}
        />
      </div>
    </div>
  );
}
