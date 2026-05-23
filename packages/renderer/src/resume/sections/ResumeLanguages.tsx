import React from 'react';
import type { ResumeLanguagesSection } from '@devfolio/shared';

const PROFICIENCY_LABEL: Record<string, string> = {
  elementary: 'Elementary',
  limited: 'Limited Working',
  professional: 'Professional Working',
  full: 'Full Professional',
  native: 'Native / Bilingual',
};

interface Props {
  section: ResumeLanguagesSection;
}

export function ResumeLanguages({ section }: Props) {
  const { heading, items } = section.data;
  if (!items.length) return null;
  return (
    <section className="resume-section">
      <h2 className="resume-section-heading">{heading}</h2>
      <div className="resume-languages">
        {items.map((item) => (
          <div key={item.id} className="resume-language-row">
            <span>{item.name}</span>
            <span>{PROFICIENCY_LABEL[item.proficiency] ?? item.proficiency}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
