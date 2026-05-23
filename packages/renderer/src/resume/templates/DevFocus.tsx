import React from 'react';
import type { Resume, ResumeSection } from '@devfolio/shared';
import { RenderedSection } from '../sections/registry';

interface Props {
  resume: Resume;
  sections: ResumeSection[];
}

/**
 * DevFocus — single column tuned for engineering resumes. Monospace headings
 * with a terminal-style `>` prefix, bordered tech chips, monospace dates. The
 * user controls section order (Projects before Experience is recommended).
 */
export function DevFocusTemplate({ sections }: Props) {
  return (
    <div className="resume-template-dev-focus">
      <style>{`
        .resume-template-dev-focus .resume-header {
          padding-bottom: 4mm;
          margin-bottom: 5mm;
          border-bottom: 0.45pt dashed var(--resume-color-rule);
        }
        .resume-template-dev-focus .resume-header-name {
          font-family: 'JetBrains Mono', monospace;
          letter-spacing: -0.005em;
        }
        .resume-template-dev-focus .resume-header-title {
          font-family: 'JetBrains Mono', monospace;
          color: var(--resume-color-accent);
        }
        .resume-template-dev-focus .resume-header-contacts {
          font-family: 'JetBrains Mono', monospace;
          font-size: calc(var(--resume-size-meta) - 0.25pt);
        }
        .resume-template-dev-focus .resume-section-heading {
          font-family: 'JetBrains Mono', monospace;
          font-size: calc(var(--resume-size-h2) - 0.5pt);
          letter-spacing: 0.04em;
          border-bottom: none;
          padding-bottom: 0;
          margin-bottom: 2.4mm;
          color: var(--resume-color-text);
        }
        .resume-template-dev-focus .resume-section-heading::before {
          content: '> ';
          color: var(--resume-color-accent);
        }
        .resume-template-dev-focus .resume-tech-row { gap: 1.2mm 1.2mm; }
        .resume-template-dev-focus .resume-tech-row > span {
          font-family: 'JetBrains Mono', monospace;
          font-size: calc(var(--resume-size-meta) - 0.5pt);
          border: 0.5pt solid var(--resume-color-rule);
          padding: 0.2mm 1.6mm;
          border-radius: 1mm;
          color: var(--resume-color-text);
          background: var(--resume-color-soft);
        }
        .resume-template-dev-focus .resume-item-meta {
          font-family: 'JetBrains Mono', monospace;
        }
        .resume-template-dev-focus .resume-skills-tags .resume-tag-list > span {
          font-family: 'JetBrains Mono', monospace;
          background: var(--resume-color-soft);
        }
      `}</style>
      {sections.map((section) => (
        <RenderedSection key={section.id} section={section} />
      ))}
    </div>
  );
}
