'use client';

import { useResumeStore } from '@/store/resume.store';
import type { ResumeCertificationsSection, ResumeCertificationItem } from '@devfolio/shared';
import { Field, TextInput, TwoCol, ItemCard, AddButton } from './primitives';
import { makeCertificationItem } from '../../sectionDefaults';

interface Props {
  section: ResumeCertificationsSection;
}

export function CertificationsForm({ section }: Props) {
  const updateSectionData = useResumeStore((s) => s.updateSectionData);
  const updateItemInSection = useResumeStore((s) => s.updateItemInSection);
  const removeItemFromSection = useResumeStore((s) => s.removeItemFromSection);
  const addItemToSection = useResumeStore((s) => s.addItemToSection);

  const patch = (id: string, p: Partial<ResumeCertificationItem>) =>
    updateItemInSection<ResumeCertificationItem>(section.id, id, p);

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
            title={item.name || 'New certification'}
            subtitle={item.issuer}
            onRemove={() => removeItemFromSection(section.id, item.id)}
            defaultOpen={!item.name}
          >
            <Field label="Certification name">
              <TextInput
                value={item.name}
                onChange={(v) => patch(item.id, { name: v })}
                placeholder="AWS Solutions Architect"
              />
            </Field>
            <Field label="Issuer">
              <TextInput
                value={item.issuer ?? ''}
                onChange={(v) => patch(item.id, { issuer: v })}
                placeholder="Amazon Web Services"
              />
            </Field>
            <TwoCol>
              <Field label="Date earned">
                <TextInput
                  value={item.date ?? ''}
                  onChange={(v) => patch(item.id, { date: v })}
                  placeholder="2024-03"
                />
              </Field>
              <Field label="Expires">
                <TextInput
                  value={item.expiryDate ?? ''}
                  onChange={(v) => patch(item.id, { expiryDate: v })}
                  placeholder="2027-03"
                />
              </Field>
            </TwoCol>
            <Field label="Credential URL">
              <TextInput
                value={item.url ?? ''}
                onChange={(v) => patch(item.id, { url: v })}
              />
            </Field>
            <Field label="Credential ID">
              <TextInput
                value={item.credentialId ?? ''}
                onChange={(v) => patch(item.id, { credentialId: v })}
              />
            </Field>
          </ItemCard>
        ))}

        <AddButton
          label="Add certification"
          onClick={() => addItemToSection(section.id, makeCertificationItem())}
        />
      </div>
    </div>
  );
}
