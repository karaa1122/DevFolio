import React from 'react';
import type { Resume, ResumeSection, ResumeSectionType } from '@devfolio/shared';
import { RenderedSection } from '../sections/registry';

interface Props {
  resume: Resume;
  sections: ResumeSection[];
}

// Section types that get the connected-dot treatment — career progression,
// not skills/projects/summary.
const TIMELINE_TYPES = new Set<ResumeSectionType>(['experience', 'education']);

/**
 * Timeline — Experience and Education render as a connected vertical
 * timeline: a dot per entry, a line joining them. Everything else stays a
 * plain section. Strong visual hierarchy for a long career history.
 */
export function TimelineTemplate({ sections }: Props) {
  return (
    <div className="resume-template-timeline">
      <style>{`
        .resume-template-timeline .resume-header {
          padding-bottom: 4mm;
          margin-bottom: 5mm;
          border-bottom: 0.45pt solid var(--resume-color-rule);
        }
        .resume-template-timeline .resume-section-heading {
          border-bottom: none;
          padding-bottom: 0;
          color: var(--resume-color-accent);
        }
        .resume-template-timeline .timeline-section .resume-item {
          position: relative;
          padding-left: 6mm;
        }
        .resume-template-timeline .timeline-section .resume-item::before {
          content: '';
          position: absolute;
          left: 0.6mm;
          top: 1.3mm;
          width: 2.2mm;
          height: 2.2mm;
          border-radius: 999px;
          background: var(--resume-color-accent);
          box-shadow: 0 0 0 1.6mm var(--resume-color-soft);
        }
        .resume-template-timeline .timeline-section .resume-item::after {
          content: '';
          position: absolute;
          left: 1.65mm;
          top: 3.5mm;
          bottom: calc(-1 * var(--resume-item-gap));
          width: 0.35mm;
          background: var(--resume-color-rule);
        }
        .resume-template-timeline .timeline-section .resume-item:last-child::after {
          display: none;
        }
      `}</style>
      {sections.map((section) => (
        <div key={section.id} className={TIMELINE_TYPES.has(section.type) ? 'timeline-section' : undefined}>
          <RenderedSection section={section} />
        </div>
      ))}
    </div>
  );
}
