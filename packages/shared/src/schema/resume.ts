import { z } from 'zod';
import {
  ExperienceItemSchema,
  EducationItemSchema,
  SkillSchema,
  ProjectSchema,
} from './portfolio';

// ─── Resume Theme ─────────────────────────────────────────────────────────────

export const ResumeThemeSchema = z.object({
  template: z.enum(['classic', 'modern', 'minimal']).default('classic'),
  accent: z.string().default('#2563eb'),
  font: z.enum(['inter', 'georgia', 'roboto']).default('inter'),
  fontSize: z.enum(['compact', 'normal', 'comfortable']).default('normal'),
  pageSize: z.enum(['a4', 'letter']).default('a4'),
});

// ─── Resume Sections ──────────────────────────────────────────────────────────

export const ResumeSummarySectionSchema = z.object({
  id: z.string(),
  type: z.literal('summary'),
  visible: z.boolean().default(true),
  data: z.object({
    heading: z.string().default('Professional Summary'),
    text: z.string().default(''),
  }),
});

export const ResumeExperienceSectionSchema = z.object({
  id: z.string(),
  type: z.literal('experience'),
  visible: z.boolean().default(true),
  data: z.object({
    heading: z.string().default('Experience'),
    items: z.array(ExperienceItemSchema).default([]),
  }),
});

export const ResumeEducationSectionSchema = z.object({
  id: z.string(),
  type: z.literal('education'),
  visible: z.boolean().default(true),
  data: z.object({
    heading: z.string().default('Education'),
    items: z.array(EducationItemSchema).default([]),
  }),
});

export const ResumeSkillsSectionSchema = z.object({
  id: z.string(),
  type: z.literal('skills'),
  visible: z.boolean().default(true),
  data: z.object({
    heading: z.string().default('Skills'),
    items: z.array(SkillSchema).default([]),
  }),
});

export const ResumeProjectsSectionSchema = z.object({
  id: z.string(),
  type: z.literal('projects'),
  visible: z.boolean().default(true),
  data: z.object({
    heading: z.string().default('Projects'),
    items: z.array(ProjectSchema).default([]),
  }),
});

export const ResumeCertificationSchema = z.object({
  id: z.string(),
  name: z.string().min(1),
  issuer: z.string().default(''),
  date: z.string().optional(),
  url: z.string().optional(),
  credentialId: z.string().optional(),
});

export const ResumeCertificationsSectionSchema = z.object({
  id: z.string(),
  type: z.literal('certifications'),
  visible: z.boolean().default(true),
  data: z.object({
    heading: z.string().default('Certifications'),
    items: z.array(ResumeCertificationSchema).default([]),
  }),
});

export const ResumeContactSectionSchema = z.object({
  id: z.string(),
  type: z.literal('contact'),
  visible: z.boolean().default(true),
  data: z.object({
    name: z.string().default(''),
    email: z.string().optional(),
    phone: z.string().optional(),
    location: z.string().optional(),
    website: z.string().optional(),
    linkedin: z.string().optional(),
    github: z.string().optional(),
  }),
});

export const ResumeSectionSchema = z.discriminatedUnion('type', [
  ResumeSummarySectionSchema,
  ResumeExperienceSectionSchema,
  ResumeEducationSectionSchema,
  ResumeSkillsSectionSchema,
  ResumeProjectsSectionSchema,
  ResumeCertificationsSectionSchema,
  ResumeContactSectionSchema,
]);

// ─── Resume Root ──────────────────────────────────────────────────────────────

export const ResumeSchema = z.object({
  id: z.string().uuid(),
  version: z.number().int().positive().default(1),
  userId: z.string().uuid(),
  portfolioId: z.string().uuid().optional(),
  title: z.string().default('My Resume'),
  theme: ResumeThemeSchema.default({}),
  layout: z.object({
    sectionsOrder: z.array(z.string()).default([]),
  }),
  sections: z.array(ResumeSectionSchema).default([]),
  metadata: z.object({
    targetRole: z.string().optional(),
    targetCompany: z.string().optional(),
    jobDescription: z.string().optional(),
    isPublic: z.boolean().default(false),
    publicId: z.string().optional(),
  }).default({}),
});

// ─── Exported Types ───────────────────────────────────────────────────────────

export type Resume = z.infer<typeof ResumeSchema>;
export type ResumeTheme = z.infer<typeof ResumeThemeSchema>;
export type ResumeSection = z.infer<typeof ResumeSectionSchema>;
export type ResumeSummarySection = z.infer<typeof ResumeSummarySectionSchema>;
export type ResumeExperienceSection = z.infer<typeof ResumeExperienceSectionSchema>;
export type ResumeEducationSection = z.infer<typeof ResumeEducationSectionSchema>;
export type ResumeSkillsSection = z.infer<typeof ResumeSkillsSectionSchema>;
export type ResumeProjectsSection = z.infer<typeof ResumeProjectsSectionSchema>;
export type ResumeCertificationsSection = z.infer<typeof ResumeCertificationsSectionSchema>;
export type ResumeContactSection = z.infer<typeof ResumeContactSectionSchema>;
export type ResumeCertification = z.infer<typeof ResumeCertificationSchema>;

export const RESUME_SECTION_TYPES = [
  'contact',
  'summary',
  'experience',
  'education',
  'skills',
  'projects',
  'certifications',
] as const;

export type ResumeSectionType = (typeof RESUME_SECTION_TYPES)[number];
