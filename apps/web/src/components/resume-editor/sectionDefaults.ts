import type { ResumeSection, ResumeSectionType } from '@devfolio/shared';
import { generateId } from '@/lib/utils';

export const RESUME_SECTION_META: Record<
  ResumeSectionType,
  { icon: string; label: string; once: boolean }
> = {
  header: { icon: '◷', label: 'Header', once: true },
  summary: { icon: '☰', label: 'Summary', once: true },
  experience: { icon: '◫', label: 'Experience', once: false },
  projects: { icon: '◆', label: 'Projects', once: false },
  education: { icon: '◐', label: 'Education', once: false },
  skills: { icon: '✱', label: 'Skills', once: false },
  certifications: { icon: '⬡', label: 'Certifications', once: false },
  awards: { icon: '★', label: 'Awards', once: false },
  languages: { icon: '⌘', label: 'Languages', once: true },
  custom: { icon: '✎', label: 'Custom', once: false },
};

export function makeSection(type: ResumeSectionType): ResumeSection {
  switch (type) {
    case 'header':
      return {
        id: generateId(),
        type: 'header',
        visible: true,
        data: {
          name: 'Your Name',
          title: 'Your Title',
          email: '',
          phone: '',
          location: '',
          website: '',
          socials: {},
          showPhoto: false,
        },
      };
    case 'summary':
      return {
        id: generateId(),
        type: 'summary',
        visible: true,
        data: { heading: 'Summary', body: '' },
      };
    case 'experience':
      return {
        id: generateId(),
        type: 'experience',
        visible: true,
        data: { heading: 'Experience', items: [] },
      };
    case 'projects':
      return {
        id: generateId(),
        type: 'projects',
        visible: true,
        data: { heading: 'Projects', items: [] },
      };
    case 'education':
      return {
        id: generateId(),
        type: 'education',
        visible: true,
        data: { heading: 'Education', items: [] },
      };
    case 'skills':
      return {
        id: generateId(),
        type: 'skills',
        visible: true,
        data: { heading: 'Skills', groups: [], layout: 'grouped', showLevels: false },
      };
    case 'certifications':
      return {
        id: generateId(),
        type: 'certifications',
        visible: true,
        data: { heading: 'Certifications', items: [] },
      };
    case 'awards':
      return {
        id: generateId(),
        type: 'awards',
        visible: true,
        data: { heading: 'Awards', items: [] },
      };
    case 'languages':
      return {
        id: generateId(),
        type: 'languages',
        visible: true,
        data: { heading: 'Languages', items: [] },
      };
    case 'custom':
      return {
        id: generateId(),
        type: 'custom',
        visible: true,
        data: { heading: 'Custom Section', items: [] },
      };
  }
}

export function makeExperienceItem() {
  return {
    id: generateId(),
    company: '',
    role: '',
    location: '',
    startDate: '',
    endDate: '',
    current: false,
    summary: '',
    bullets: [],
    technologies: [],
  };
}

export function makeProjectItem() {
  return {
    id: generateId(),
    name: '',
    description: '',
    url: '',
    repoUrl: '',
    bullets: [],
    technologies: [],
  };
}

export function makeEducationItem() {
  return {
    id: generateId(),
    institution: '',
    degree: '',
    field: '',
    location: '',
    startDate: '',
    endDate: '',
    current: false,
    gpa: '',
    details: [],
  };
}

export function makeSkillGroup() {
  return { id: generateId(), category: '', items: [] };
}

export function makeCertificationItem() {
  return {
    id: generateId(),
    name: '',
    issuer: '',
    date: '',
    expiryDate: '',
    url: '',
    credentialId: '',
  };
}

export function makeAwardItem() {
  return { id: generateId(), name: '', issuer: '', date: '', description: '' };
}

export function makeLanguageItem() {
  return { id: generateId(), name: '', proficiency: 'professional' as const };
}

export function makeCustomItem() {
  return {
    id: generateId(),
    title: '',
    subtitle: '',
    location: '',
    date: '',
    url: '',
    description: '',
    bullets: [],
  };
}
