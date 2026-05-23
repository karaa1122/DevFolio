import React from 'react';
import type { Resume, ResumeSection } from '@devfolio/shared';
import { RenderedSection } from '../sections/registry';

interface Props {
  resume: Resume;
  sections: ResumeSection[];
}

/**
 * Compact — for senior people with 10+ years to fit on one page. Tighter
 * line-height, smaller meta type, no rules under headings, smaller heading.
 * Saves ~30% vertical space compared to Classic.
 */
export function CompactTemplate({ sections }: Props) {
  return (
    <div className="resume-template-compact">
      <style>{`
        .resume-template-compact { line-height: 1.34; }
        .resume-template-compact .resume-section {
          margin-bottom: calc(var(--resume-section-gap) * 0.65);
        }
        .resume-template-compact .resume-section-heading {
          font-size: calc(var(--resume-size-h2) - 0.5pt);
          border-bottom: none;
          padding-bottom: 0;
          margin-bottom: 1.6mm;
          color: var(--resume-color-text);
          letter-spacing: 0.14em;
        }
        .resume-template-compact .resume-section-heading::after {
          content: '';
          display: block;
          width: 8mm;
          height: 0.6pt;
          background: var(--resume-color-accent);
          margin-top: 1mm;
        }
        .resume-template-compact .resume-item { margin-bottom: 2.4mm; }
        .resume-template-compact .resume-item-bullets li { margin-bottom: 0.2mm; }
        .resume-template-compact .resume-item-bullets {
          margin-top: 0.8mm;
        }
        .resume-template-compact .resume-header { margin-bottom: 4mm; }
        .resume-template-compact .resume-header-name {
          font-size: calc(var(--resume-size-name) - 1pt);
        }
        .resume-template-compact .resume-header-contacts {
          margin-top: 1.4mm;
          font-size: calc(var(--resume-size-meta) - 0.5pt);
        }
      `}</style>
      {sections.map((section) => (
        <RenderedSection key={section.id} section={section} />
      ))}
    </div>
  );
}
