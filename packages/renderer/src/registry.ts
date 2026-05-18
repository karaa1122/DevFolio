import type { SectionType } from '@devfolio/shared';
import type { ComponentType } from 'react';
import { HeroSection } from './sections/HeroSection';
import { AboutSection } from './sections/AboutSection';
import { ProjectsSection } from './sections/ProjectsSection';
import { SkillsSection } from './sections/SkillsSection';
import { ExperienceSection } from './sections/ExperienceSection';
import { EducationSection } from './sections/EducationSection';
import { ContactSection } from './sections/ContactSection';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const sectionRegistry: Record<SectionType, ComponentType<any>> = {
  hero: HeroSection,
  about: AboutSection,
  projects: ProjectsSection,
  skills: SkillsSection,
  experience: ExperienceSection,
  education: EducationSection,
  contact: ContactSection,
};
