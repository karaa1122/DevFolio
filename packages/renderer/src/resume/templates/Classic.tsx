import React from 'react';
import type { Resume, ResumeSection } from '@devfolio/shared';
import { RenderedSection } from '../sections/registry';

interface Props {
  resume: Resume;
  sections: ResumeSection[];
}

/**
 * Classic — single-column, ATS-friendly, recruiter-favorite. Centered name,
 * inline contacts under it, sections stack with a thin accent rule under each
 * heading. The most-printed FlowCV-style layout.
 */
export function ClassicTemplate({ sections }: Props) {
  return (
    <div className="resume-template-classic">
      <style>{`
        .resume-template-classic .resume-header {
          text-align: center;
          padding-bottom: 4mm;
          border-bottom: 0.45pt solid var(--resume-color-rule);
        }
        .resume-template-classic .resume-header-name {
          letter-spacing: 0.015em;
          font-weight: 700;
        }
        .resume-template-classic .resume-header-title {
          margin-top: 0.6mm;
        }
        .resume-template-classic .resume-header-contacts {
          justify-content: center;
        }
        .resume-template-classic .resume-section-heading {
          color: var(--resume-color-text);
          border-bottom: 0.45pt solid var(--resume-color-rule);
        }
      `}</style>
      {sections.map((section) => (
        <RenderedSection key={section.id} section={section} />
      ))}
    </div>
  );
}
