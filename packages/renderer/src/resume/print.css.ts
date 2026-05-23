import type { Resume } from '@devfolio/shared';

const FONT_FAMILY: Record<string, string> = {
  inter: "'Inter', sans-serif",
  'source-sans': "'Source Sans 3', 'Source Sans Pro', sans-serif",
  'ibm-plex-sans': "'IBM Plex Sans', sans-serif",
  lora: "'Lora', serif",
  merriweather: "'Merriweather', serif",
  'jetbrains-mono': "'JetBrains Mono', monospace",
};

const FONT_URL: Record<string, string> = {
  inter:
    'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap',
  'source-sans':
    'https://fonts.googleapis.com/css2?family=Source+Sans+3:wght@400;500;600;700&display=swap',
  'ibm-plex-sans':
    'https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@400;500;600;700&display=swap',
  lora: 'https://fonts.googleapis.com/css2?family=Lora:wght@400;500;600;700&display=swap',
  merriweather:
    'https://fonts.googleapis.com/css2?family=Merriweather:wght@400;700;900&display=swap',
  'jetbrains-mono':
    'https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600;700&display=swap',
};

// Refined typographic scale. Body sizes are conservative (10–11pt) so resumes
// read cleanly on paper; meta is one step down; name uses the modular gap.
const SIZE_SCALE = {
  xs: { body: 9.5, name: 22, h2: 9.5, meta: 8.25, sub: 9 },
  sm: { body: 10, name: 24, h2: 10, meta: 8.75, sub: 9.5 },
  md: { body: 10.5, name: 26, h2: 10.5, meta: 9.25, sub: 10 },
  lg: { body: 11, name: 28, h2: 11, meta: 9.75, sub: 10.5 },
};

const LINE_HEIGHT = { tight: 1.34, normal: 1.5, relaxed: 1.65 };

// Vertical gap between sections, in mm. Drives the overall density feel.
const DENSITY_GAP = { compact: 5.5, normal: 8.5, relaxed: 12 };

const MARGIN_MM = { narrow: 10, normal: 14, wide: 20 };

const PAGE_SIZE = {
  A4: { width: 210, height: 297 },
  Letter: { width: 215.9, height: 279.4 },
};

export interface PrintCssOptions {
  /** When true, screen-only chrome (page shadow, gap between pages) is included. */
  forScreen?: boolean;
}

export function buildResumeCss(resume: Resume, opts: PrintCssOptions = {}): string {
  const t = resume.theme;
  const size = SIZE_SCALE[t.fontSize];
  const lh = LINE_HEIGHT[t.lineHeight];
  const gap = DENSITY_GAP[resume.density];
  const margin = MARGIN_MM[resume.page.margin];
  const page = PAGE_SIZE[resume.page.format];
  const fontFamily = FONT_FAMILY[t.font] ?? FONT_FAMILY.inter;
  const headingFamily = FONT_FAMILY[t.headingFont ?? t.font] ?? fontFamily;

  return `
:root {
  --resume-font: ${fontFamily};
  --resume-heading-font: ${headingFamily};
  --resume-color-text: ${t.text};
  --resume-color-muted: ${t.muted};
  --resume-color-accent: ${t.accent};
  --resume-color-rule: ${t.rule};
  --resume-color-soft: ${hexToRgba(t.accent, 0.08)};
  --resume-page-w: ${page.width}mm;
  --resume-page-h: ${page.height}mm;
  --resume-page-pad: ${margin}mm;
  --resume-section-gap: ${gap}mm;
  --resume-item-gap: ${(gap * 0.7).toFixed(2)}mm;
  --resume-size-body: ${size.body}pt;
  --resume-size-name: ${size.name}pt;
  --resume-size-h2: ${size.h2}pt;
  --resume-size-meta: ${size.meta}pt;
  --resume-size-sub: ${size.sub}pt;
  --resume-line: ${lh};
}

/* ─── Document foundation ─────────────────────────────────────────── */

.resume-doc {
  font-family: var(--resume-font);
  color: var(--resume-color-text);
  font-size: var(--resume-size-body);
  line-height: var(--resume-line);
  -webkit-print-color-adjust: exact;
  print-color-adjust: exact;
  font-feature-settings: 'kern' 1, 'liga' 1, 'calt' 1, 'tnum' 1;
  text-rendering: optimizeLegibility;
  -webkit-font-smoothing: antialiased;
}
.resume-doc, .resume-doc * { box-sizing: border-box; }
.resume-doc h1, .resume-doc h2, .resume-doc h3 {
  font-family: var(--resume-heading-font);
  font-weight: 600;
  margin: 0;
  line-height: 1.2;
}
.resume-doc h1 {
  font-size: var(--resume-size-name);
  font-weight: 700;
  letter-spacing: -0.018em;
}
.resume-doc h2 {
  font-size: var(--resume-size-h2);
  text-transform: uppercase;
  letter-spacing: 0.11em;
  font-weight: 700;
}
.resume-doc p, .resume-doc ul, .resume-doc ol { margin: 0; }
.resume-doc ul { list-style: none; padding: 0; }
.resume-doc a { color: inherit; text-decoration: none; }
.resume-doc strong { font-weight: 600; }
.resume-doc em { font-style: italic; }

.resume-page {
  width: var(--resume-page-w);
  min-height: var(--resume-page-h);
  padding: var(--resume-page-pad);
  background: #ffffff;
  position: relative;
  overflow: hidden;
}

/* ─── Section primitives ──────────────────────────────────────────── */

.resume-section {
  margin-bottom: var(--resume-section-gap);
  break-inside: avoid-page;
}
.resume-section:last-child { margin-bottom: 0; }
.resume-section-heading {
  color: var(--resume-color-accent);
  border-bottom: 0.45pt solid var(--resume-color-rule);
  padding-bottom: 1.3mm;
  margin-bottom: 2.8mm;
  break-after: avoid;
}

/* ─── Item primitives (experience / education / projects) ─────────── */

.resume-item {
  break-inside: avoid;
  margin-bottom: var(--resume-item-gap);
}
.resume-item:last-child { margin-bottom: 0; }
.resume-item-head {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  gap: 4mm;
  margin-bottom: 1.2mm;
}
.resume-item-title {
  font-weight: 600;
  color: var(--resume-color-text);
}
.resume-item-sub {
  color: var(--resume-color-muted);
  font-size: var(--resume-size-sub);
}
.resume-item-sub-strong {
  color: var(--resume-color-text);
  font-weight: 500;
  font-size: var(--resume-size-sub);
}
.resume-item-meta {
  color: var(--resume-color-muted);
  font-size: var(--resume-size-meta);
  white-space: nowrap;
  font-variant-numeric: tabular-nums;
}
.resume-item-summary {
  color: var(--resume-color-muted);
  margin-top: 0.8mm;
}
.resume-item-bullets {
  padding-left: 4.5mm;
  margin-top: 1.6mm;
}
.resume-item-bullets li {
  position: relative;
  margin-bottom: 1.2mm;
}
.resume-item-bullets li::before {
  content: '';
  position: absolute;
  left: -3mm;
  top: 0.55em;
  width: 1.2mm;
  height: 1.2mm;
  border-radius: 999px;
  background: var(--resume-color-accent);
}
.resume-item-bullets li:last-child { margin-bottom: 0; }

.resume-tech-row {
  display: flex;
  flex-wrap: wrap;
  gap: 0.8mm 2.5mm;
  margin-top: 1.4mm;
  font-size: var(--resume-size-meta);
  color: var(--resume-color-muted);
}
.resume-tech-row > span { white-space: nowrap; }

/* ─── Header ──────────────────────────────────────────────────────── */

.resume-header { margin-bottom: var(--resume-section-gap); }
.resume-header-name { margin-bottom: 0.4mm; }
.resume-header-title {
  color: var(--resume-color-muted);
  font-size: calc(var(--resume-size-body) + 1pt);
  font-weight: 400;
  letter-spacing: 0.005em;
}
.resume-header-contacts {
  display: flex;
  flex-wrap: wrap;
  gap: 1.6mm 4mm;
  margin-top: 2.8mm;
  font-size: var(--resume-size-meta);
  color: var(--resume-color-muted);
}
.resume-header-contacts a {
  color: inherit;
  text-decoration: none;
}
.resume-header-contacts a:hover { text-decoration: underline; }
.resume-header-contact {
  display: inline-flex;
  align-items: center;
}
.resume-header-contact-icon {
  flex-shrink: 0;
  line-height: 0;
}
.resume-header-contact-icon svg { display: block; }

/* ─── Skills — six layouts ────────────────────────────────────────── */

.resume-skills-grouped .resume-skill-row {
  display: grid;
  grid-template-columns: 28% 1fr;
  gap: 3mm;
  margin-bottom: 1.4mm;
  align-items: baseline;
}
.resume-skills-grouped .resume-skill-row:last-child { margin-bottom: 0; }
.resume-skills-grouped .resume-skill-category {
  font-weight: 600;
  color: var(--resume-color-text);
}
.resume-skills-grouped .resume-skill-items { color: var(--resume-color-muted); }

.resume-skills-compact { color: var(--resume-color-muted); }
.resume-skills-compact .resume-skill-row + .resume-skill-row::before {
  content: '·';
  margin: 0 1.8mm;
  color: var(--resume-color-rule);
  font-weight: 700;
}
.resume-skills-compact .resume-skill-category {
  font-weight: 600;
  color: var(--resume-color-text);
  margin-right: 1mm;
}

.resume-skills-tags .resume-skill-group {
  margin-bottom: 2.4mm;
}
.resume-skills-tags .resume-skill-group:last-child { margin-bottom: 0; }
.resume-skills-tags .resume-skill-category {
  font-weight: 600;
  font-size: var(--resume-size-meta);
  color: var(--resume-color-text);
  text-transform: uppercase;
  letter-spacing: 0.06em;
  margin-bottom: 1.3mm;
}
.resume-skills-tags .resume-tag-list {
  display: flex;
  flex-wrap: wrap;
  gap: 1.2mm 1.5mm;
}
.resume-skills-tags .resume-tag-list > span {
  border: 0.5pt solid var(--resume-color-rule);
  background: #fff;
  padding: 0.4mm 2.2mm;
  border-radius: 1.5mm;
  font-size: var(--resume-size-meta);
  color: var(--resume-color-text);
}

.resume-skills-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 3mm 4mm;
}
.resume-skills-grid .resume-skill-group {
  break-inside: avoid;
}
.resume-skills-grid .resume-skill-category {
  font-weight: 600;
  color: var(--resume-color-accent);
  font-size: var(--resume-size-meta);
  text-transform: uppercase;
  letter-spacing: 0.08em;
  margin-bottom: 1.2mm;
  padding-bottom: 0.8mm;
  border-bottom: 0.4pt solid var(--resume-color-soft);
}
.resume-skills-grid .resume-skill-items {
  color: var(--resume-color-muted);
  line-height: 1.5;
}

.resume-skills-bars .resume-skill-group { margin-bottom: 2mm; }
.resume-skills-bars .resume-skill-group:last-child { margin-bottom: 0; }
.resume-skills-bars .resume-skill-category {
  font-weight: 600;
  font-size: var(--resume-size-meta);
  color: var(--resume-color-text);
  text-transform: uppercase;
  letter-spacing: 0.06em;
  margin-bottom: 1.2mm;
}
.resume-skills-bars .resume-bar-row {
  display: grid;
  grid-template-columns: 42% 1fr;
  gap: 3mm;
  align-items: center;
  margin-bottom: 1mm;
}
.resume-skills-bars .resume-bar-row:last-child { margin-bottom: 0; }
.resume-skills-bars .resume-bar-name {
  color: var(--resume-color-text);
  font-size: var(--resume-size-body);
}
.resume-skills-bars .resume-bar-track {
  height: 1.2mm;
  background: var(--resume-color-soft);
  border-radius: 999px;
  overflow: hidden;
}
.resume-skills-bars .resume-bar-fill {
  height: 100%;
  background: var(--resume-color-accent);
  border-radius: 999px;
}

.resume-skills-minimal .resume-skill-row {
  margin-bottom: 1mm;
  color: var(--resume-color-text);
}
.resume-skills-minimal .resume-skill-row:last-child { margin-bottom: 0; }
.resume-skills-minimal .resume-skill-category {
  font-weight: 600;
  margin-right: 1mm;
}
.resume-skills-minimal .resume-skill-items { color: var(--resume-color-text); }

/* ─── Languages ───────────────────────────────────────────────────── */

.resume-languages {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1.3mm 4mm;
}
.resume-language-row {
  display: flex;
  justify-content: space-between;
  gap: 3mm;
  align-items: baseline;
}
.resume-language-row > span:first-child {
  color: var(--resume-color-text);
  font-weight: 500;
}
.resume-language-row > span:last-child {
  color: var(--resume-color-muted);
  font-size: var(--resume-size-meta);
}

/* ─── Summary ─────────────────────────────────────────────────────── */

.resume-summary-body { color: var(--resume-color-text); }

/* ─── Rich text (Tiptap-emitted) ──────────────────────────────────── */
/* Applies to summary / description / bullet bodies that may now contain
 * <p>, <strong>, <em>, <u>, <a>, <ul>, <ol>, <li>, plus alignment classes. */

.resume-rich p {
  margin: 0;
}
.resume-rich p + p {
  margin-top: 1.2mm;
}
.resume-rich strong { font-weight: 600; color: var(--resume-color-text); }
.resume-rich em { font-style: italic; }
.resume-rich u { text-decoration: underline; text-underline-offset: 1.5px; }
.resume-rich s { text-decoration: line-through; }
.resume-rich a {
  color: var(--resume-color-accent);
  text-decoration: none;
  border-bottom: 0.3pt solid var(--resume-color-accent);
}
.resume-rich ul, .resume-rich ol {
  padding-left: 4.5mm;
  margin: 1mm 0 0;
}
.resume-rich ul { list-style: none; }
.resume-rich ol { list-style: decimal; }
.resume-rich ul li, .resume-rich ol li {
  position: relative;
  margin-bottom: 0.5mm;
}
.resume-rich ul li::before {
  content: '';
  position: absolute;
  left: -3mm;
  top: 0.55em;
  width: 1.2mm;
  height: 1.2mm;
  border-radius: 999px;
  background: var(--resume-color-accent);
}
.resume-rich .text-left   { text-align: left; }
.resume-rich .text-center { text-align: center; }
.resume-rich .text-right  { text-align: right; }
.resume-rich .text-justify { text-align: justify; }

/* Bullet sections (.resume-item-bullets) may now contain rich content per
 * <li> via dangerouslySetInnerHTML — make sure inline tags inherit color. */
.resume-item-bullets a {
  color: var(--resume-color-accent);
  text-decoration: none;
  border-bottom: 0.3pt solid var(--resume-color-accent);
}

/* ─── Print rules ─────────────────────────────────────────────────── */

@page { size: ${resume.page.format}; margin: 0; }

@media print {
  body { margin: 0; background: #ffffff; }
  .resume-page { box-shadow: none; margin: 0; }
  .resume-page + .resume-page { page-break-before: always; }
}

${
  opts.forScreen
    ? `
/* Screen-only chrome — never appears in the PDF. */
.resume-page {
  margin: 0 auto;
  box-shadow:
    0 1px 1px rgba(15, 23, 42, 0.04),
    0 4px 12px rgba(15, 23, 42, 0.08),
    0 24px 56px -8px rgba(15, 23, 42, 0.18);
  border-radius: 2px;
}
.resume-page + .resume-page { margin-top: 16mm; position: relative; }
.resume-page + .resume-page::before {
  content: '';
  position: absolute;
  top: -8mm;
  left: 50%;
  transform: translateX(-50%);
  width: 32mm;
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(148, 163, 184, 0.35), transparent);
}
`
    : ''
}

${
  resume.ats
    ? `
/* ATS-mode overrides — maximum compatibility with applicant tracking parsers. */
.resume-doc {
  font-family: 'Helvetica', Arial, sans-serif !important;
  color: #000 !important;
}
.resume-doc h1, .resume-doc h2, .resume-doc h3 {
  font-family: 'Helvetica', Arial, sans-serif !important;
  color: #000 !important;
}
.resume-doc .resume-section-heading {
  color: #000 !important;
  border-bottom: 0.6pt solid #000 !important;
  text-transform: uppercase !important;
}
.resume-doc .resume-item-bullets li::before {
  background: #000 !important;
  width: 1mm !important; height: 1mm !important;
}
.resume-doc .resume-tech-row > span,
.resume-doc .resume-skills-tags .resume-tag-list > span {
  border-color: #000 !important;
  color: #000 !important;
  background: #fff !important;
}
.resume-doc .resume-skills-bars .resume-bar-track { background: #f4f4f4 !important; }
.resume-doc .resume-skills-bars .resume-bar-fill { background: #000 !important; }
.resume-doc .resume-header-contact-icon { color: #000 !important; }
.resume-doc a { color: #000 !important; text-decoration: underline; border-bottom: none !important; }
.resume-doc .resume-rich ul li::before { background: #000 !important; }
.resume-doc .resume-rich strong { color: #000 !important; }
/* Force single-column so parsers read top-to-bottom */
.resume-template-sidebar-cols,
.resume-template-two-column-cols { display: block !important; }
.resume-template-sidebar aside,
.resume-template-two-column-cols > div { width: 100% !important; }
.resume-template-sidebar .resume-header {
  background: transparent !important;
  color: #000 !important;
  padding: 0 !important;
  margin: 0 0 4mm 0 !important;
}
.resume-template-sidebar .resume-header-name,
.resume-template-sidebar .resume-header-title,
.resume-template-sidebar .resume-header-contacts { color: #000 !important; }
.resume-template-modern .resume-section-heading {
  border-left: none !important;
  padding-left: 0 !important;
  border-bottom: 0.6pt solid #000 !important;
  padding-bottom: 1.3mm !important;
}
`
    : ''
}
`.trim();
}

export function buildResumeFontLink(resume: Resume): string {
  const url = FONT_URL[resume.theme.font] ?? FONT_URL.inter;
  return url;
}

// ─── helpers ──────────────────────────────────────────────────────────────

function hexToRgba(hex: string, alpha: number): string {
  const m = /^#?([0-9a-f]{6}|[0-9a-f]{3})$/i.exec(hex.trim());
  if (!m) return `rgba(99, 102, 241, ${alpha})`;
  let h = m[1];
  if (h.length === 3) h = h.split('').map((c) => c + c).join('');
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}
