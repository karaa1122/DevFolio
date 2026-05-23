import React from 'react';
import type { Resume, ResumeSection, ResumeSectionType } from '@devfolio/shared';
import { RenderedSection } from '../sections/registry';

interface Props {
  resume: Resume;
  sections: ResumeSection[];
}

// Left column: the chronological narrative. Right column: supporting material.
const LEFT_TYPES = new Set<ResumeSectionType>(['summary', 'experience', 'projects']);
const RIGHT_TYPES = new Set<ResumeSectionType>([
  'education',
  'skills',
  'certifications',
  'awards',
  'languages',
  'custom',
]);

/**
 * TwoColumn — 60/40 split below a centered header. Left holds summary +
 * experience + projects; right holds education + skills + certs. JSON order is
 * preserved within each column.
 */
export function TwoColumnTemplate({ sections }: Props) {
  const headerSection = sections.find((s) => s.type === 'header');
  const remaining = sections.filter((s) => s.type !== 'header');
  const left = remaining.filter((s) => LEFT_TYPES.has(s.type));
  const right = remaining.filter((s) => RIGHT_TYPES.has(s.type));

  return (
    <div className="resume-template-two-column">
      <style>{`
        .resume-template-two-column .resume-header {
          margin-bottom: 6mm;
          text-align: center;
          padding-bottom: 4mm;
          border-bottom: 0.6pt solid var(--resume-color-accent);
        }
        .resume-template-two-column .resume-header-contacts {
          justify-content: center;
        }
        .resume-template-two-column-cols {
          display: grid;
          grid-template-columns: 1.45fr 1fr;
          gap: 8mm;
        }
        .resume-template-two-column .resume-section-heading {
          font-size: calc(var(--resume-size-h2) - 0.5pt);
          border-bottom: 0.45pt solid var(--resume-color-rule);
        }
        /* Skills inside the narrower right column collapse to a single column */
        .resume-template-two-column-cols > div:last-child .resume-skills-grid {
          grid-template-columns: 1fr;
        }
        .resume-template-two-column-cols > div:last-child .resume-languages {
          grid-template-columns: 1fr;
        }
      `}</style>

      {headerSection && <RenderedSection key={headerSection.id} section={headerSection} />}

      <div className="resume-template-two-column-cols">
        <div>
          {left.map((section) => (
            <RenderedSection key={section.id} section={section} />
          ))}
        </div>
        <div>
          {right.map((section) => (
            <RenderedSection key={section.id} section={section} />
          ))}
        </div>
      </div>
    </div>
  );
}
