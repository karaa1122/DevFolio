export { PortfolioRenderer } from './PortfolioRenderer';
export { sectionRegistry } from './registry';
export { HeroSection } from './sections/HeroSection';
export { AboutSection } from './sections/AboutSection';
export { ProjectsSection } from './sections/ProjectsSection';
export { SkillsSection } from './sections/SkillsSection';
export { ExperienceSection } from './sections/ExperienceSection';
export { EducationSection } from './sections/EducationSection';
export { ContactSection } from './sections/ContactSection';

// ─── Resume ────────────────────────────────────────────────────────────────
export { ResumeRenderer } from './resume/ResumeRenderer';
export { buildResumeCss, buildResumeFontLink } from './resume/print.css';
export { resumeSectionRegistry } from './resume/sections/registry';
export { resumeTemplateRegistry } from './resume/templates/registry';
export { formatDate, formatDateRange } from './resume/format';
export { renderInlineMarkdown } from './resume/inline-markdown';
export { renderResumeContent, markdownToHtml, isResumeHtml } from './resume/rich-text';
