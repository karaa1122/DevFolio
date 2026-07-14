import React from 'react';
import type { Resume, ResumeSection } from '@devfolio/shared';
import { RenderedSection } from '../sections/registry';

interface Props {
  resume: Resume;
  sections: ResumeSection[];
}

/**
 * Noir — a dark-mode resume. Near-black page, neon accent headings with a
 * subtle glow, monospace meta. Bold on screen and in the PDF; automatically
 * flips to plain black-on-white when ATS mode is on (see print.css.ts).
 */
export function NoirTemplate({ sections }: Props) {
  return (
    <div className="resume-template-noir">
      <style>{`
        .resume-template-noir {
          --resume-color-text: #edf2f1;
          --resume-color-muted: #93a29c;
          --resume-color-rule: #263230;
          --resume-color-soft: rgba(45, 212, 191, 0.08);
          /* Explicit re-read so descendants without their own color rule
             (e.g. the header name) inherit the overridden value above,
             instead of whatever .resume-doc resolved to further up. */
          color: var(--resume-color-text);
        }
        /* .resume-page is an ancestor of this template root, not a
           descendant — :has() is the only way to reach up and tint it. */
        .resume-page:has(.resume-template-noir) {
          background: #0a0f0e;
        }
        .resume-template-noir .resume-header {
          padding-bottom: 4mm;
          margin-bottom: 5mm;
          border-bottom: 0.6pt solid var(--resume-color-rule);
        }
        .resume-template-noir .resume-header-name {
          font-family: 'JetBrains Mono', monospace;
          letter-spacing: -0.01em;
          text-shadow: 0 0 6mm var(--resume-color-accent);
        }
        .resume-template-noir .resume-header-title {
          color: var(--resume-color-accent);
          font-family: 'JetBrains Mono', monospace;
        }
        .resume-template-noir .resume-header-contacts {
          font-family: 'JetBrains Mono', monospace;
          font-size: calc(var(--resume-size-meta) - 0.25pt);
        }
        .resume-template-noir .resume-section-heading {
          font-family: 'JetBrains Mono', monospace;
          color: var(--resume-color-accent);
          border-bottom: 0.45pt solid var(--resume-color-rule);
          text-shadow: 0 0 4mm var(--resume-color-accent);
        }
        .resume-template-noir .resume-item-title { color: var(--resume-color-text); }
        .resume-template-noir .resume-item-meta { font-family: 'JetBrains Mono', monospace; }
        .resume-template-noir .resume-tech-row > span,
        .resume-template-noir .resume-skills-tags .resume-tag-list > span {
          font-family: 'JetBrains Mono', monospace;
          border: 0.5pt solid var(--resume-color-rule);
          background: var(--resume-color-soft);
          color: var(--resume-color-text);
          border-radius: 1mm;
          padding: 0.2mm 1.6mm;
        }
        .resume-template-noir .resume-item-bullets li::before,
        .resume-template-noir .resume-rich ul li::before {
          box-shadow: 0 0 2mm var(--resume-color-accent);
        }
        .resume-template-noir .resume-skills-bars .resume-bar-track {
          background: rgba(255, 255, 255, 0.08);
        }
      `}</style>
      {sections.map((section) => (
        <RenderedSection key={section.id} section={section} />
      ))}
    </div>
  );
}
