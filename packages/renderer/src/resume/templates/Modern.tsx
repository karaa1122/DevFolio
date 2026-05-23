import React from 'react';
import type { Resume, ResumeSection } from '@devfolio/shared';
import { RenderedSection } from '../sections/registry';

interface Props {
  resume: Resume;
  sections: ResumeSection[];
}

/**
 * Modern — left-aligned oversized name, accent vertical bar to the left of
 * each section heading, role titles in accent color. Targets product /
 * design-leaning roles where confident visual hierarchy matters.
 */
export function ModernTemplate({ sections }: Props) {
  return (
    <div className="resume-template-modern">
      <style>{`
        .resume-template-modern .resume-header {
          padding-bottom: 4mm;
          margin-bottom: 5mm;
        }
        .resume-template-modern .resume-header-name {
          font-size: calc(var(--resume-size-name) + 4pt);
          font-weight: 800;
          letter-spacing: -0.02em;
        }
        .resume-template-modern .resume-header-title {
          color: var(--resume-color-accent);
          font-weight: 500;
          margin-top: 0.8mm;
        }
        .resume-template-modern .resume-section-heading {
          border-bottom: none;
          color: var(--resume-color-text);
          padding-bottom: 0;
          margin-bottom: 2.8mm;
          padding-left: 3.5mm;
          position: relative;
        }
        .resume-template-modern .resume-section-heading::before {
          content: '';
          position: absolute;
          left: 0;
          top: 0.4mm;
          bottom: 0.4mm;
          width: 0.9mm;
          border-radius: 999px;
          background: var(--resume-color-accent);
        }
        .resume-template-modern .resume-item-title {
          color: var(--resume-color-accent);
          font-weight: 600;
        }
      `}</style>
      {sections.map((section) => (
        <RenderedSection key={section.id} section={section} />
      ))}
    </div>
  );
}
