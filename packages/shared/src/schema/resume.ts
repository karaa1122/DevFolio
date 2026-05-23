import { z } from 'zod';

// ─── Resume Theme (print-safe) ────────────────────────────────────────────
// Subset of portfolio Theme: only colors/fonts proven to render cleanly on paper.
// No dark mode, no gradient backgrounds — resumes are always rendered on white.

export const ResumeThemeSchema = z.object({
  accent: z.string().default('#2563eb'),
  text: z.string().default('#111111'),
  muted: z.string().default('#555555'),
  rule: z.string().default('#d1d5db'),
  font: z
    .enum(['inter', 'source-sans', 'ibm-plex-sans', 'lora', 'merriweather', 'jetbrains-mono'])
    .default('inter'),
  headingFont: z
    .enum(['inter', 'source-sans', 'ibm-plex-sans', 'lora', 'merriweather', 'jetbrains-mono'])
    .optional(),
  fontSize: z.enum(['xs', 'sm', 'md', 'lg']).default('md'),
  lineHeight: z.enum(['tight', 'normal', 'relaxed']).default('normal'),
});

// ─── Page settings ────────────────────────────────────────────────────────

export const ResumePageSchema = z.object({
  format: z.enum(['A4', 'Letter']).default('A4'),
  margin: z.enum(['narrow', 'normal', 'wide']).default('normal'),
});

// ─── Section: Header ──────────────────────────────────────────────────────
// The personal/contact block at the top of every resume.

export const ResumeSocialsSchema = z
  .object({
    github: z.string().optional(),
    linkedin: z.string().optional(),
    twitter: z.string().optional(),
    devto: z.string().optional(),
    stackoverflow: z.string().optional(),
    portfolio: z.string().optional(),
  })
  .default({});

// Email is stored as a plain optional string — NOT validated with .email()
// at save time. While editing, intermediate values like "kara@gmail" /
// "user@" must be persistable, and the renderer doesn't care if it looks
// like a valid mailbox. Strict RFC-5321 validation belongs at publish or
// PDF-export time, not on every autosave tick.
export const ResumeHeaderSectionSchema = z.object({
  id: z.string(),
  type: z.literal('header'),
  visible: z.boolean().default(true),
  data: z.object({
    name: z.string().default(''),
    title: z.string().optional(),
    email: z.string().optional(),
    phone: z.string().optional(),
    location: z.string().optional(),
    website: z.string().optional(),
    socials: ResumeSocialsSchema,
    photo: z.string().optional(),
    showPhoto: z.boolean().default(false),
  }),
});

// ─── Section: Summary ─────────────────────────────────────────────────────

export const ResumeSummarySectionSchema = z.object({
  id: z.string(),
  type: z.literal('summary'),
  visible: z.boolean().default(true),
  data: z.object({
    heading: z.string().default('Summary'),
    body: z.string().default(''),
  }),
});

// ─── Section: Experience ──────────────────────────────────────────────────

export const ResumeExperienceItemSchema = z.object({
  id: z.string(),
  company: z.string().default(''),
  role: z.string().default(''),
  location: z.string().optional(),
  startDate: z.string().default(''),
  endDate: z.string().optional(),
  current: z.boolean().default(false),
  summary: z.string().optional(),
  bullets: z.array(z.string()).default([]),
  technologies: z.array(z.string()).default([]),
  type: z
    .enum(['full-time', 'part-time', 'contract', 'internship', 'freelance'])
    .optional(),
});

export const ResumeExperienceSectionSchema = z.object({
  id: z.string(),
  type: z.literal('experience'),
  visible: z.boolean().default(true),
  data: z.object({
    heading: z.string().default('Experience'),
    items: z.array(ResumeExperienceItemSchema).default([]),
  }),
});

// ─── Section: Projects ────────────────────────────────────────────────────

export const ResumeProjectItemSchema = z.object({
  id: z.string(),
  name: z.string().default(''),
  description: z.string().optional(),
  url: z.string().optional(),
  repoUrl: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  bullets: z.array(z.string()).default([]),
  technologies: z.array(z.string()).default([]),
  year: z.number().int().optional(),
});

export const ResumeProjectsSectionSchema = z.object({
  id: z.string(),
  type: z.literal('projects'),
  visible: z.boolean().default(true),
  data: z.object({
    heading: z.string().default('Projects'),
    items: z.array(ResumeProjectItemSchema).default([]),
  }),
});

// ─── Section: Education ───────────────────────────────────────────────────

export const ResumeEducationItemSchema = z.object({
  id: z.string(),
  institution: z.string().default(''),
  degree: z.string().default(''),
  field: z.string().optional(),
  location: z.string().optional(),
  startDate: z.string().default(''),
  endDate: z.string().optional(),
  current: z.boolean().default(false),
  gpa: z.string().optional(),
  details: z.array(z.string()).default([]),
});

export const ResumeEducationSectionSchema = z.object({
  id: z.string(),
  type: z.literal('education'),
  visible: z.boolean().default(true),
  data: z.object({
    heading: z.string().default('Education'),
    items: z.array(ResumeEducationItemSchema).default([]),
  }),
});

// ─── Section: Skills ──────────────────────────────────────────────────────
// Skills are always grouped by category (Languages, Frameworks, Tools…) — the
// `layout` flag decides how those groups render on paper. Six layouts cover
// everything from ATS-safe single-line runs to spaced tag grids.

export const ResumeSkillItemSchema = z.union([
  z.string(),
  z.object({
    name: z.string().min(1),
    level: z.number().int().min(1).max(5).optional(),
    years: z.number().int().min(0).max(60).optional(),
  }),
]);

export const ResumeSkillGroupSchema = z.object({
  id: z.string(),
  category: z.string().default(''),
  items: z.array(z.string()).default([]),
});

export const RESUME_SKILL_LAYOUTS = [
  'grouped', // Category | comma-separated skills (classic resume layout)
  'tags', // Bordered chips, grouped under each category
  'bars', // Skill name + filled bar (uses `level` when present)
  'compact', // One long inline run — most space-efficient
  'grid', // Card grid: category as title, skills as bullets
  'minimal', // ATS-pure: each line = "Category: skill, skill, skill"
] as const;

// Legacy layout names that older resumes in the DB may still carry. Mapped to
// their modern equivalents during parse so the user doesn't see broken saves.
const LEGACY_SKILL_LAYOUTS: Record<string, (typeof RESUME_SKILL_LAYOUTS)[number]> = {
  inline: 'compact',
};

const ResumeSkillLayoutSchema = z.preprocess((v) => {
  if (typeof v === 'string' && v in LEGACY_SKILL_LAYOUTS) return LEGACY_SKILL_LAYOUTS[v];
  return v;
}, z.enum(RESUME_SKILL_LAYOUTS).default('grouped'));

export const ResumeSkillsSectionSchema = z.object({
  id: z.string(),
  type: z.literal('skills'),
  visible: z.boolean().default(true),
  data: z.object({
    heading: z.string().default('Skills'),
    groups: z.array(ResumeSkillGroupSchema).default([]),
    layout: ResumeSkillLayoutSchema,
    /** When true, layouts that support it render level bars / dots. */
    showLevels: z.boolean().default(false),
  }),
});

// ─── Section: Certifications ──────────────────────────────────────────────

export const ResumeCertificationItemSchema = z.object({
  id: z.string(),
  name: z.string().default(''),
  issuer: z.string().optional(),
  date: z.string().optional(),
  expiryDate: z.string().optional(),
  url: z.string().optional(),
  credentialId: z.string().optional(),
});

export const ResumeCertificationsSectionSchema = z.object({
  id: z.string(),
  type: z.literal('certifications'),
  visible: z.boolean().default(true),
  data: z.object({
    heading: z.string().default('Certifications'),
    items: z.array(ResumeCertificationItemSchema).default([]),
  }),
});

// ─── Section: Awards ──────────────────────────────────────────────────────

export const ResumeAwardItemSchema = z.object({
  id: z.string(),
  name: z.string().default(''),
  issuer: z.string().optional(),
  date: z.string().optional(),
  description: z.string().optional(),
});

export const ResumeAwardsSectionSchema = z.object({
  id: z.string(),
  type: z.literal('awards'),
  visible: z.boolean().default(true),
  data: z.object({
    heading: z.string().default('Awards'),
    items: z.array(ResumeAwardItemSchema).default([]),
  }),
});

// ─── Section: Languages ───────────────────────────────────────────────────

export const ResumeLanguageItemSchema = z.object({
  id: z.string(),
  name: z.string().default(''),
  proficiency: z
    .enum(['elementary', 'limited', 'professional', 'full', 'native'])
    .default('professional'),
});

export const ResumeLanguagesSectionSchema = z.object({
  id: z.string(),
  type: z.literal('languages'),
  visible: z.boolean().default(true),
  data: z.object({
    heading: z.string().default('Languages'),
    items: z.array(ResumeLanguageItemSchema).default([]),
  }),
});

// ─── Section: Custom ──────────────────────────────────────────────────────
// Free-form section (Publications, Volunteer Work, Speaking, etc.).
// Editor exposes this so users aren't locked to the curated section types.

export const ResumeCustomItemSchema = z.object({
  id: z.string(),
  title: z.string().default(''),
  subtitle: z.string().optional(),
  location: z.string().optional(),
  date: z.string().optional(),
  url: z.string().optional(),
  description: z.string().optional(),
  bullets: z.array(z.string()).default([]),
});

export const ResumeCustomSectionSchema = z.object({
  id: z.string(),
  type: z.literal('custom'),
  visible: z.boolean().default(true),
  data: z.object({
    heading: z.string().default('Custom Section'),
    items: z.array(ResumeCustomItemSchema).default([]),
  }),
});

// ─── Discriminated union ──────────────────────────────────────────────────

export const ResumeSectionSchema = z.discriminatedUnion('type', [
  ResumeHeaderSectionSchema,
  ResumeSummarySectionSchema,
  ResumeExperienceSectionSchema,
  ResumeProjectsSectionSchema,
  ResumeEducationSectionSchema,
  ResumeSkillsSectionSchema,
  ResumeCertificationsSectionSchema,
  ResumeAwardsSectionSchema,
  ResumeLanguagesSectionSchema,
  ResumeCustomSectionSchema,
]);

// ─── Resume root ──────────────────────────────────────────────────────────

export const ResumeMetadataSchema = z.object({
  title: z.string().optional(),
  fileName: z.string().optional(),
  targetRole: z.string().optional(),
  notes: z.string().optional(),
});

export const RESUME_TEMPLATE_IDS = [
  'classic',
  'modern',
  'compact',
  'sidebar',
  'two-column',
  'dev-focus',
] as const;

export const ResumeTemplateIdSchema = z.enum(RESUME_TEMPLATE_IDS);

export const ResumeSchema = z.object({
  id: z.string().uuid(),
  slug: z
    .string()
    .regex(/^[a-z0-9-]+$/, 'Slug must be lowercase alphanumeric with hyphens')
    .min(3)
    .max(50),
  version: z.number().int().positive().default(1),
  userId: z.string().uuid(),
  template: ResumeTemplateIdSchema.default('classic'),
  theme: ResumeThemeSchema.default({}),
  page: ResumePageSchema.default({}),
  density: z.enum(['compact', 'normal', 'relaxed']).default('normal'),
  /** When true, renderer overrides template with single-column + system fonts + black text + no accent. */
  ats: z.boolean().default(false),
  layout: z.object({
    sectionsOrder: z.array(z.string()).default([]),
  }),
  sections: z.array(ResumeSectionSchema).default([]),
  metadata: ResumeMetadataSchema.default({}),
});

// ─── Exported types ───────────────────────────────────────────────────────

export type Resume = z.infer<typeof ResumeSchema>;
export type ResumeTheme = z.infer<typeof ResumeThemeSchema>;
export type ResumePage = z.infer<typeof ResumePageSchema>;
export type ResumeSection = z.infer<typeof ResumeSectionSchema>;
export type ResumeTemplateId = z.infer<typeof ResumeTemplateIdSchema>;
export type ResumeMetadata = z.infer<typeof ResumeMetadataSchema>;

export type ResumeHeaderSection = z.infer<typeof ResumeHeaderSectionSchema>;
export type ResumeSummarySection = z.infer<typeof ResumeSummarySectionSchema>;
export type ResumeExperienceSection = z.infer<typeof ResumeExperienceSectionSchema>;
export type ResumeProjectsSection = z.infer<typeof ResumeProjectsSectionSchema>;
export type ResumeEducationSection = z.infer<typeof ResumeEducationSectionSchema>;
export type ResumeSkillsSection = z.infer<typeof ResumeSkillsSectionSchema>;
export type ResumeCertificationsSection = z.infer<typeof ResumeCertificationsSectionSchema>;
export type ResumeAwardsSection = z.infer<typeof ResumeAwardsSectionSchema>;
export type ResumeLanguagesSection = z.infer<typeof ResumeLanguagesSectionSchema>;
export type ResumeCustomSection = z.infer<typeof ResumeCustomSectionSchema>;

export type ResumeExperienceItem = z.infer<typeof ResumeExperienceItemSchema>;
export type ResumeProjectItem = z.infer<typeof ResumeProjectItemSchema>;
export type ResumeEducationItem = z.infer<typeof ResumeEducationItemSchema>;
export type ResumeSkillGroup = z.infer<typeof ResumeSkillGroupSchema>;
export type ResumeSkillLayout = (typeof RESUME_SKILL_LAYOUTS)[number];
export type ResumeCertificationItem = z.infer<typeof ResumeCertificationItemSchema>;
export type ResumeAwardItem = z.infer<typeof ResumeAwardItemSchema>;
export type ResumeLanguageItem = z.infer<typeof ResumeLanguageItemSchema>;
export type ResumeCustomItem = z.infer<typeof ResumeCustomItemSchema>;
export type ResumeSocials = z.infer<typeof ResumeSocialsSchema>;

// ─── Section type guard helpers (mirror portfolio.ts) ─────────────────────

export const RESUME_SECTION_TYPES = [
  'header',
  'summary',
  'experience',
  'projects',
  'education',
  'skills',
  'certifications',
  'awards',
  'languages',
  'custom',
] as const;

export type ResumeSectionType = (typeof RESUME_SECTION_TYPES)[number];

export function getResumeSectionById(
  resume: Resume,
  id: string,
): ResumeSection | undefined {
  return resume.sections.find((s) => s.id === id);
}

export function getOrderedResumeSections(resume: Resume): ResumeSection[] {
  const byId = new Map(resume.sections.map((s) => [s.id, s]));
  return resume.layout.sectionsOrder
    .map((id) => byId.get(id))
    .filter((s): s is ResumeSection => s !== undefined);
}
