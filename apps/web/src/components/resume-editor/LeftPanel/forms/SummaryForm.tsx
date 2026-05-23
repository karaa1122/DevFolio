'use client';

import { useResumeStore } from '@/store/resume.store';
import type { ResumeSummarySection } from '@devfolio/shared';
import { Field, TextInput, RichEditField } from './primitives';

interface Props {
  section: ResumeSummarySection;
}

export function SummaryForm({ section }: Props) {
  const updateSectionData = useResumeStore((s) => s.updateSectionData);
  const { heading, body } = section.data;
  const patch = (p: Partial<ResumeSummarySection['data']>) =>
    updateSectionData(section.id, p);

  return (
    <div className="space-y-4">
      <Field label="Heading">
        <TextInput value={heading} onChange={(v) => patch({ heading: v })} />
      </Field>
      <Field label="Summary" hint="2–3 sentences. Specific beats clever.">
        <RichEditField
          value={body}
          onChange={(v) => patch({ body: v })}
          label="Professional Summary"
          placeholder="Backend engineer with 5 years scaling distributed systems at companies like ..."
          emptyHint="Click to write a summary"
        />
      </Field>
    </div>
  );
}
