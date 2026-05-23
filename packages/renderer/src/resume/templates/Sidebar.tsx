import React from 'react';
import type { Resume, ResumeSection, ResumeSectionType } from '@devfolio/shared';
import { RenderedSection } from '../sections/registry';

interface Props {
  resume: Resume;
  sections: ResumeSection[];
}

// Section types that live in the left sidebar.
const SIDEBAR_TYPES = new Set<ResumeSectionType>([
  'skills',
  'languages',
  'certifications',
  'awards',
]);

/**
 * Sidebar — narrow accent-tinted left column (32%) with skills + languages +
 * certs, wider right column (68%) with summary + experience + projects +
 * education. Header bleeds full-width with an accent band behind it.
 *
 * Falls back to single-column when the sidebar would be empty (e.g. user hasn't
 * added skills yet, or the paginator moved them to a later page) — otherwise
 * we'd render an awkward empty accent panel.
 */
export function SidebarTemplate({ resume, sections }: Props) {
  const headerSection = sections.find((s) => s.type === 'header');
  const remaining = sections.filter((s) => s.type !== 'header');
  const sidebar = remaining.filter((s) => SIDEBAR_TYPES.has(s.type));
  const main = remaining.filter((s) => !SIDEBAR_TYPES.has(s.type));

  const sharedStyle = (
    <style>{`
      .resume-template-sidebar { display: flex; flex-direction: column; gap: 5mm; }
      .resume-template-sidebar .resume-header {
        background: ${resume.theme.accent};
        color: #fff;
        padding: 6mm 8mm;
        margin: calc(-1 * var(--resume-page-pad));
        margin-bottom: 5mm;
      }
      .resume-template-sidebar .resume-header-name {
        color: #fff;
        font-weight: 700;
        letter-spacing: -0.015em;
      }
      .resume-template-sidebar .resume-header-title {
        color: rgba(255, 255, 255, 0.9);
        margin-top: 0.6mm;
      }
      .resume-template-sidebar .resume-header-contacts { color: rgba(255, 255, 255, 0.85); }
      .resume-template-sidebar .resume-header-contacts a { color: rgba(255, 255, 255, 0.9); }
      .resume-template-sidebar .resume-header-contact-icon { color: rgba(255, 255, 255, 0.9) !important; }
    `}</style>
  );

  // No sidebar content → render as a single column. Header still bleeds, but
  // the body flows normally; no empty accent panel.
  if (sidebar.length === 0) {
    return (
      <div className="resume-template-sidebar">
        {sharedStyle}
        {headerSection && <RenderedSection key={headerSection.id} section={headerSection} />}
        <div>
          {main.map((section) => (
            <RenderedSection key={section.id} section={section} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="resume-template-sidebar">
      {sharedStyle}
      <style>{`
        .resume-template-sidebar-cols {
          display: grid;
          grid-template-columns: 32% 1fr;
          gap: 7mm;
        }
        .resume-template-sidebar-cols aside {
          background: var(--resume-color-soft);
          padding: 5mm;
          border-radius: 2mm;
          margin-top: -2mm;
        }
        .resume-template-sidebar-cols .resume-section-heading {
          border-bottom: none;
          padding-bottom: 0;
          margin-bottom: 2mm;
          font-size: calc(var(--resume-size-h2) - 0.5pt);
          color: var(--resume-color-accent);
        }
        .resume-template-sidebar aside .resume-skills-grouped .resume-skill-row {
          display: block;
          margin-bottom: 2mm;
        }
        .resume-template-sidebar aside .resume-skills-grouped .resume-skill-category {
          margin-bottom: 0.3mm;
        }
      `}</style>

      {headerSection && <RenderedSection key={headerSection.id} section={headerSection} />}

      <div className="resume-template-sidebar-cols">
        <aside>
          {sidebar.map((section) => (
            <RenderedSection key={section.id} section={section} />
          ))}
        </aside>
        <div>
          {main.map((section) => (
            <RenderedSection key={section.id} section={section} />
          ))}
        </div>
      </div>
    </div>
  );
}
