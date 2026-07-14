import React from 'react';
import type { Resume, ResumeSection, ResumeSectionType } from '@devfolio/shared';
import { RenderedSection } from '../sections/registry';

interface Props {
  resume: Resume;
  sections: ResumeSection[];
}

// Section types substantial enough to earn a full-width card.
const WIDE_TYPES = new Set<ResumeSectionType>(['experience', 'projects']);

/**
 * Bento — every section after the header becomes a bordered card in a
 * two-column grid. Experience and Projects span both columns; everything
 * else (summary, skills, education, certs, languages) sits two-up. Falls
 * back to a single column in ATS mode (see print.css.ts).
 */
export function BentoTemplate({ sections }: Props) {
  const headerSection = sections.find((s) => s.type === 'header');
  const rest = sections.filter((s) => s.type !== 'header');

  return (
    <div className="resume-template-bento">
      <style>{`
        .resume-template-bento .resume-header {
          padding-bottom: 4mm;
          margin-bottom: 5mm;
          border-bottom: 0.7pt solid var(--resume-color-accent);
        }
        .resume-template-bento-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 4.5mm;
        }
        .resume-template-bento-grid > div {
          border: 0.6pt solid var(--resume-color-rule);
          border-radius: 2.5mm;
          padding: 4mm 4.5mm;
          break-inside: avoid;
        }
        .resume-template-bento-grid > .bento-wide { grid-column: 1 / -1; }
        .resume-template-bento-grid .resume-section { margin-bottom: 0; }
        .resume-template-bento .resume-section-heading {
          border-bottom: none;
          padding-bottom: 0;
          color: var(--resume-color-accent);
          font-size: calc(var(--resume-size-h2) - 0.5pt);
        }
      `}</style>

      {headerSection && <RenderedSection key={headerSection.id} section={headerSection} />}

      <div className="resume-template-bento-grid">
        {rest.map((section) => (
          <div key={section.id} className={WIDE_TYPES.has(section.type) ? 'bento-wide' : undefined}>
            <RenderedSection section={section} />
          </div>
        ))}
      </div>
    </div>
  );
}
