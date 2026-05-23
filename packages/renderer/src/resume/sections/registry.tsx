import React, { type ComponentType } from 'react';
import type { ResumeSection, ResumeSectionType } from '@devfolio/shared';
import { ResumeHeader } from './ResumeHeader';
import { ResumeSummary } from './ResumeSummary';
import { ResumeExperience } from './ResumeExperience';
import { ResumeProjects } from './ResumeProjects';
import { ResumeEducation } from './ResumeEducation';
import { ResumeSkills } from './ResumeSkills';
import { ResumeCertifications } from './ResumeCertifications';
import { ResumeAwards } from './ResumeAwards';
import { ResumeLanguages } from './ResumeLanguages';
import { ResumeCustom } from './ResumeCustom';

interface SectionComponentProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  section: any;
}

export const resumeSectionRegistry: Record<
  ResumeSectionType,
  ComponentType<SectionComponentProps>
> = {
  header: ResumeHeader,
  summary: ResumeSummary,
  experience: ResumeExperience,
  projects: ResumeProjects,
  education: ResumeEducation,
  skills: ResumeSkills,
  certifications: ResumeCertifications,
  awards: ResumeAwards,
  languages: ResumeLanguages,
  custom: ResumeCustom,
};

/**
 * Renders a section with a `data-section-id` wrapper so the editor canvas can
 * resolve clicks back to the source section. `display: contents` keeps the
 * wrapper out of the layout tree so print pagination rules still apply to the
 * inner `.resume-section` element.
 */
export function RenderedSection({ section }: { section: ResumeSection }) {
  const Component = resumeSectionRegistry[section.type];
  if (!Component) return null;
  return (
    <div data-section-id={section.id} style={{ display: 'contents' }}>
      <Component section={section} />
    </div>
  );
}
