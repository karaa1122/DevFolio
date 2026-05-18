import { z } from 'zod';

// ─── Theme ────────────────────────────────────────────────────────────────────

export const ThemeColorsSchema = z.object({
  primary: z.string().default('#7c3aed'),
  secondary: z.string().default('#a78bfa'),
  background: z.string().default('#0f172a'),
  foreground: z.string().default('#f8fafc'),
  muted: z.string().default('#94a3b8'),
  accent: z.string().default('#06b6d4'),
  card: z.string().default('#1e293b'),
  border: z.string().default('#334155'),
});

export const ThemeSchema = z.object({
  colors: ThemeColorsSchema.default({}),
  font: z
    .enum(['inter', 'roboto', 'poppins', 'fira-code', 'jetbrains-mono'])
    .default('inter'),
  radius: z.enum(['none', 'sm', 'md', 'lg', 'full']).default('md'),
  darkMode: z.boolean().default(true),
  spacing: z.enum(['compact', 'normal', 'relaxed']).default('normal'),
});

// ─── Section: Hero ─────────────────────────────────────────────────────────

export const HeroSectionSchema = z.object({
  id: z.string(),
  type: z.literal('hero'),
  visible: z.boolean().default(true),
  data: z.object({
    name: z.string().min(1),
    title: z.string().min(1),
    subtitle: z.string().optional(),
    bio: z.string().optional(),
    avatar: z.string().optional(),
    location: z.string().optional(),
    availableForWork: z.boolean().default(false),
    cta: z
      .object({
        label: z.string(),
        href: z.string(),
        variant: z.enum(['primary', 'outline']).default('primary'),
      })
      .optional(),
  }),
});

// ─── Section: About ────────────────────────────────────────────────────────

export const AboutSectionSchema = z.object({
  id: z.string(),
  type: z.literal('about'),
  visible: z.boolean().default(true),
  data: z.object({
    heading: z.string().default('About Me'),
    bio: z.string().min(1),
    highlights: z.array(z.string()).default([]),
    image: z.string().optional(),
  }),
});

// ─── Section: Projects ─────────────────────────────────────────────────────

export const ProjectSchema = z.object({
  id: z.string(),
  title: z.string().min(1),
  description: z.string(),
  image: z.string().optional(),
  tags: z.array(z.string()).default([]),
  liveUrl: z.string().optional(),
  repoUrl: z.string().optional(),
  featured: z.boolean().default(false),
  year: z.number().int().optional(),
  status: z.enum(['completed', 'in-progress', 'archived']).default('completed'),
});

export const ProjectsSectionSchema = z.object({
  id: z.string(),
  type: z.literal('projects'),
  visible: z.boolean().default(true),
  data: z.object({
    heading: z.string().default('Projects'),
    subheading: z.string().optional(),
    items: z.array(ProjectSchema).default([]),
    layout: z.enum(['grid', 'list', 'masonry']).default('grid'),
    showFeaturedOnly: z.boolean().default(false),
  }),
});

// ─── Section: Skills ───────────────────────────────────────────────────────

export const SkillSchema = z.object({
  id: z.string(),
  name: z.string().min(1),
  level: z.number().int().min(0).max(100).optional(),
  category: z.string().optional(),
  icon: z.string().optional(),
});

export const SkillsSectionSchema = z.object({
  id: z.string(),
  type: z.literal('skills'),
  visible: z.boolean().default(true),
  data: z.object({
    heading: z.string().default('Skills'),
    subheading: z.string().optional(),
    items: z.array(SkillSchema).default([]),
    layout: z.enum(['tags', 'bars', 'grid']).default('tags'),
    showLevels: z.boolean().default(false),
  }),
});

// ─── Section: Experience ───────────────────────────────────────────────────

export const ExperienceItemSchema = z.object({
  id: z.string(),
  company: z.string().min(1),
  role: z.string().min(1),
  startDate: z.string(),
  endDate: z.string().optional(),
  current: z.boolean().default(false),
  description: z.string().optional(),
  highlights: z.array(z.string()).default([]),
  logo: z.string().optional(),
  location: z.string().optional(),
  type: z.enum(['full-time', 'part-time', 'contract', 'internship', 'freelance']).optional(),
});

export const ExperienceSectionSchema = z.object({
  id: z.string(),
  type: z.literal('experience'),
  visible: z.boolean().default(true),
  data: z.object({
    heading: z.string().default('Experience'),
    items: z.array(ExperienceItemSchema).default([]),
    layout: z.enum(['timeline', 'cards']).default('timeline'),
  }),
});

// ─── Section: Education ────────────────────────────────────────────────────

export const EducationItemSchema = z.object({
  id: z.string(),
  institution: z.string().min(1),
  degree: z.string().min(1),
  field: z.string().optional(),
  startDate: z.string(),
  endDate: z.string().optional(),
  current: z.boolean().default(false),
  gpa: z.string().optional(),
  description: z.string().optional(),
  logo: z.string().optional(),
});

export const EducationSectionSchema = z.object({
  id: z.string(),
  type: z.literal('education'),
  visible: z.boolean().default(true),
  data: z.object({
    heading: z.string().default('Education'),
    items: z.array(EducationItemSchema).default([]),
  }),
});

// ─── Section: Contact ──────────────────────────────────────────────────────

export const ContactSectionSchema = z.object({
  id: z.string(),
  type: z.literal('contact'),
  visible: z.boolean().default(true),
  data: z.object({
    heading: z.string().default('Get In Touch'),
    subheading: z.string().optional(),
    email: z.string().email().optional(),
    phone: z.string().optional(),
    location: z.string().optional(),
    socials: z
      .object({
        github: z.string().optional(),
        linkedin: z.string().optional(),
        twitter: z.string().optional(),
        website: z.string().optional(),
        youtube: z.string().optional(),
        devto: z.string().optional(),
      })
      .default({}),
    showContactForm: z.boolean().default(true),
  }),
});

// ─── Discriminated Union ───────────────────────────────────────────────────

export const SectionSchema = z.discriminatedUnion('type', [
  HeroSectionSchema,
  AboutSectionSchema,
  ProjectsSectionSchema,
  SkillsSectionSchema,
  ExperienceSectionSchema,
  EducationSectionSchema,
  ContactSectionSchema,
]);

// ─── Portfolio Root ────────────────────────────────────────────────────────

export const PortfolioMetadataSchema = z.object({
  title: z.string().optional(),
  description: z.string().optional(),
  keywords: z.array(z.string()).default([]),
  ogImage: z.string().optional(),
  favicon: z.string().optional(),
  customDomain: z.string().optional(),
  gaTrackingId: z.string().optional(),
  twitterHandle: z.string().optional(),
});

export const PortfolioSchema = z.object({
  id: z.string().uuid(),
  slug: z
    .string()
    .regex(/^[a-z0-9-]+$/, 'Slug must be lowercase alphanumeric with hyphens')
    .min(3)
    .max(50),
  version: z.number().int().positive().default(1),
  userId: z.string().uuid(),
  theme: ThemeSchema.default({}),
  layout: z.object({
    sectionsOrder: z.array(z.string()).default([]),
  }),
  sections: z.array(SectionSchema).default([]),
  metadata: PortfolioMetadataSchema.default({}),
});

// ─── Exported Types ────────────────────────────────────────────────────────

export type Portfolio = z.infer<typeof PortfolioSchema>;
export type Theme = z.infer<typeof ThemeSchema>;
export type ThemeColors = z.infer<typeof ThemeColorsSchema>;
export type Section = z.infer<typeof SectionSchema>;
export type HeroSection = z.infer<typeof HeroSectionSchema>;
export type AboutSection = z.infer<typeof AboutSectionSchema>;
export type ProjectsSection = z.infer<typeof ProjectsSectionSchema>;
export type SkillsSection = z.infer<typeof SkillsSectionSchema>;
export type ExperienceSection = z.infer<typeof ExperienceSectionSchema>;
export type EducationSection = z.infer<typeof EducationSectionSchema>;
export type ContactSection = z.infer<typeof ContactSectionSchema>;
export type Project = z.infer<typeof ProjectSchema>;
export type Skill = z.infer<typeof SkillSchema>;
export type ExperienceItem = z.infer<typeof ExperienceItemSchema>;
export type EducationItem = z.infer<typeof EducationItemSchema>;
export type PortfolioMetadata = z.infer<typeof PortfolioMetadataSchema>;

// ─── Section type guard helpers ────────────────────────────────────────────

export const SECTION_TYPES = [
  'hero',
  'about',
  'projects',
  'skills',
  'experience',
  'education',
  'contact',
] as const;

export type SectionType = (typeof SECTION_TYPES)[number];

export function getSectionById(portfolio: Portfolio, id: string): Section | undefined {
  return portfolio.sections.find((s) => s.id === id);
}

export function getOrderedSections(portfolio: Portfolio): Section[] {
  const byId = new Map(portfolio.sections.map((s) => [s.id, s]));
  return portfolio.layout.sectionsOrder
    .map((id) => byId.get(id))
    .filter((s): s is Section => s !== undefined);
}
