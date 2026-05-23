'use client';

import { useResumeStore } from '@/store/resume.store';
import type { ResumeSection } from '@devfolio/shared';
import { HeaderForm } from './forms/HeaderForm';
import { SummaryForm } from './forms/SummaryForm';
import { ExperienceForm } from './forms/ExperienceForm';
import { ProjectsForm } from './forms/ProjectsForm';
import { EducationForm } from './forms/EducationForm';
import { SkillsForm } from './forms/SkillsForm';
import { CertificationsForm } from './forms/CertificationsForm';
import { AwardsForm } from './forms/AwardsForm';
import { LanguagesForm } from './forms/LanguagesForm';
import { CustomForm } from './forms/CustomForm';
import { RESUME_SECTION_META } from '../sectionDefaults';

interface Props {
  sectionId: string;
}

export function SectionForm({ sectionId }: Props) {
  const section = useResumeStore((s) =>
    s.resume?.sections.find((sec) => sec.id === sectionId),
  );
  const selectSection = useResumeStore((s) => s.selectSection);
  const updateSectionVisibility = useResumeStore((s) => s.updateSectionVisibility);
  const duplicateSection = useResumeStore((s) => s.duplicateSection);
  const removeSection = useResumeStore((s) => s.removeSection);

  if (!section) return null;

  const meta = RESUME_SECTION_META[section.type];

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-2 px-3 py-2.5 border-b border-slate-800/70 shrink-0 sticky top-0 bg-slate-950/95 backdrop-blur-xl z-10">
        <button
          onClick={() => selectSection(null)}
          className="text-slate-400 hover:text-slate-100 w-7 h-7 rounded-md hover:bg-slate-800/70 grid place-items-center transition-colors"
          title="Back to sections"
          aria-label="Back"
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="19" y1="12" x2="5" y2="12" />
            <polyline points="12 19 5 12 12 5" />
          </svg>
        </button>
        <span className="w-6 h-6 rounded-md bg-slate-800/70 text-slate-300 text-xs grid place-items-center">
          {meta?.icon}
        </span>
        <span className="text-sm font-semibold text-slate-100 flex-1 min-w-0 truncate">
          {meta?.label}
        </span>
        <div className="flex items-center gap-0.5">
          <button
            onClick={() => updateSectionVisibility(sectionId, !section.visible)}
            className="text-slate-500 hover:text-slate-200 w-7 h-7 rounded-md hover:bg-slate-800/70 grid place-items-center transition-colors"
            title={section.visible ? 'Hide on resume' : 'Show on resume'}
          >
            {section.visible ? (
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8Z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
            ) : (
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                <line x1="1" y1="1" x2="23" y2="23" />
              </svg>
            )}
          </button>
          <button
            onClick={() => duplicateSection(sectionId)}
            className="text-slate-500 hover:text-slate-200 w-7 h-7 rounded-md hover:bg-slate-800/70 grid place-items-center transition-colors"
            title="Duplicate section"
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
            </svg>
          </button>
          <button
            onClick={() => {
              if (window.confirm('Delete this section? This cannot be undone.')) {
                removeSection(sectionId);
              }
            }}
            className="text-slate-500 hover:text-red-400 w-7 h-7 rounded-md hover:bg-red-500/10 grid place-items-center transition-colors"
            title="Delete section"
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="3 6 5 6 21 6" />
              <path d="M19 6l-2 14a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2L5 6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
            </svg>
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4">{renderForm(section)}</div>
    </div>
  );
}

function renderForm(section: ResumeSection) {
  switch (section.type) {
    case 'header':
      return <HeaderForm section={section} />;
    case 'summary':
      return <SummaryForm section={section} />;
    case 'experience':
      return <ExperienceForm section={section} />;
    case 'projects':
      return <ProjectsForm section={section} />;
    case 'education':
      return <EducationForm section={section} />;
    case 'skills':
      return <SkillsForm section={section} />;
    case 'certifications':
      return <CertificationsForm section={section} />;
    case 'awards':
      return <AwardsForm section={section} />;
    case 'languages':
      return <LanguagesForm section={section} />;
    case 'custom':
      return <CustomForm section={section} />;
  }
}
