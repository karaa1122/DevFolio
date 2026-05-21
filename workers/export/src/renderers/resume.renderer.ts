import type {
  Resume,
  ResumeSection,
  ResumeContactSection,
  ResumeSummarySection,
  ResumeExperienceSection,
  ResumeEducationSection,
  ResumeSkillsSection,
  ResumeProjectsSection,
  ResumeCertificationsSection,
} from '@devfolio/shared';

function esc(str: string | undefined | null): string {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function fontStack(font: string): string {
  const map: Record<string, string> = {
    inter: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    georgia: "Georgia, 'Times New Roman', Times, serif",
    roboto: "'Roboto', -apple-system, BlinkMacSystemFont, sans-serif",
  };
  return map[font] ?? map['inter'];
}

function fontSizeBase(size: string): string {
  return size === 'compact' ? '11px' : size === 'comfortable' ? '13px' : '12px';
}

// ─── Section renderers ────────────────────────────────────────────────────────

function renderContact(s: ResumeContactSection, accent: string): string {
  const { name, email, phone, location, website, linkedin, github } = s.data;
  const links: string[] = [];
  if (email) links.push(`<a href="mailto:${esc(email)}">${esc(email)}</a>`);
  if (phone) links.push(`<span>${esc(phone)}</span>`);
  if (location) links.push(`<span>${esc(location)}</span>`);
  if (website) links.push(`<a href="${esc(website)}">${esc(website.replace(/^https?:\/\//, ''))}</a>`);
  if (linkedin) links.push(`<a href="${esc(linkedin)}">${esc(linkedin.replace(/^https?:\/\//, ''))}</a>`);
  if (github) links.push(`<a href="${esc(github)}">${esc(github.replace(/^https?:\/\//, ''))}</a>`);

  return `
<header class="contact-header">
  <h1 class="contact-name">${esc(name)}</h1>
  ${links.length ? `<div class="contact-links">${links.join('<span class="sep"> · </span>')}</div>` : ''}
</header>`;
}

function renderSummary(s: ResumeSummarySection): string {
  if (!s.data.text) return '';
  return `
<section class="resume-section">
  <h2 class="section-heading">${esc(s.data.heading)}</h2>
  <p class="summary-text">${esc(s.data.text)}</p>
</section>`;
}

function renderExperience(s: ResumeExperienceSection): string {
  if (!s.data.items.length) return '';
  const items = s.data.items.map(item => `
    <div class="entry">
      <div class="entry-header">
        <div class="entry-left">
          <span class="entry-title">${esc(item.role)}</span>
          ${item.company ? `<span class="entry-sub"> · ${esc(item.company)}</span>` : ''}
        </div>
        <div class="entry-right">
          ${item.startDate ? `<span class="entry-date">${esc(item.startDate)}${item.current ? ' – Present' : item.endDate ? ` – ${esc(item.endDate)}` : ''}</span>` : ''}
          ${item.location ? `<span class="entry-location">${esc(item.location)}</span>` : ''}
        </div>
      </div>
      ${item.description ? `<p class="entry-desc">${esc(item.description)}</p>` : ''}
      ${item.highlights?.length ? `<div class="tags">${item.highlights.map(t => `<span class="tag">${esc(t)}</span>`).join('')}</div>` : ''}
    </div>`).join('');
  return `
<section class="resume-section">
  <h2 class="section-heading">${esc(s.data.heading)}</h2>
  ${items}
</section>`;
}

function renderEducation(s: ResumeEducationSection): string {
  if (!s.data.items.length) return '';
  const items = s.data.items.map(item => `
    <div class="entry">
      <div class="entry-header">
        <div class="entry-left">
          <span class="entry-title">${esc(item.degree ?? '')}${item.field ? `, ${esc(item.field)}` : ''}</span>
          ${item.institution ? `<span class="entry-sub"> · ${esc(item.institution)}</span>` : ''}
        </div>
        <div class="entry-right">
          ${item.startDate ? `<span class="entry-date">${esc(item.startDate)}${item.current ? ' – Present' : item.endDate ? ` – ${esc(item.endDate)}` : ''}</span>` : ''}
          ${item.gpa ? `<span class="entry-location">GPA: ${esc(item.gpa)}</span>` : ''}
        </div>
      </div>
      ${item.description ? `<p class="entry-desc">${esc(item.description)}</p>` : ''}
    </div>`).join('');
  return `
<section class="resume-section">
  <h2 class="section-heading">${esc(s.data.heading)}</h2>
  ${items}
</section>`;
}

function renderSkills(s: ResumeSkillsSection): string {
  if (!s.data.items.length) return '';
  const categories = new Map<string, string[]>();
  for (const skill of s.data.items) {
    const cat = skill.category ?? 'Skills';
    if (!categories.has(cat)) categories.set(cat, []);
    categories.get(cat)!.push(skill.name);
  }
  const rows = Array.from(categories.entries()).map(([cat, names]) =>
    `<div class="skill-row"><span class="skill-cat">${esc(cat)}:</span> <span class="skill-names">${names.map(esc).join(', ')}</span></div>`
  ).join('');
  return `
<section class="resume-section">
  <h2 class="section-heading">${esc(s.data.heading)}</h2>
  <div class="skills-grid">${rows}</div>
</section>`;
}

function renderProjects(s: ResumeProjectsSection): string {
  if (!s.data.items.length) return '';
  const items = s.data.items.map(item => `
    <div class="entry">
      <div class="entry-header">
        <div class="entry-left">
          <span class="entry-title">${item.liveUrl ? `<a href="${esc(item.liveUrl)}">${esc(item.title)}</a>` : esc(item.title)}</span>
        </div>
      </div>
      ${item.description ? `<p class="entry-desc">${esc(item.description)}</p>` : ''}
      ${item.tags?.length ? `<div class="tags">${item.tags.map(t => `<span class="tag">${esc(t)}</span>`).join('')}</div>` : ''}
    </div>`).join('');
  return `
<section class="resume-section">
  <h2 class="section-heading">${esc(s.data.heading)}</h2>
  ${items}
</section>`;
}

function renderCertifications(s: ResumeCertificationsSection): string {
  if (!s.data.items.length) return '';
  const items = s.data.items.map(item => `
    <div class="entry">
      <div class="entry-header">
        <div class="entry-left">
          <span class="entry-title">${item.url ? `<a href="${esc(item.url)}">${esc(item.name)}</a>` : esc(item.name)}</span>
          ${item.issuer ? `<span class="entry-sub"> · ${esc(item.issuer)}</span>` : ''}
        </div>
        ${item.date ? `<div class="entry-right"><span class="entry-date">${esc(item.date)}</span></div>` : ''}
      </div>
      ${item.credentialId ? `<p class="entry-desc">Credential ID: ${esc(item.credentialId)}</p>` : ''}
    </div>`).join('');
  return `
<section class="resume-section">
  <h2 class="section-heading">${esc(s.data.heading)}</h2>
  ${items}
</section>`;
}

function renderSection(section: ResumeSection): string {
  if (!section.visible) return '';
  switch (section.type) {
    case 'contact':      return renderContact(section, '');
    case 'summary':      return renderSummary(section);
    case 'experience':   return renderExperience(section);
    case 'education':    return renderEducation(section);
    case 'skills':       return renderSkills(section);
    case 'projects':     return renderProjects(section);
    case 'certifications': return renderCertifications(section);
    default:             return '';
  }
}

// ─── Template CSS ─────────────────────────────────────────────────────────────

function buildCss(resume: Resume): string {
  const { accent, font, fontSize, template } = resume.theme;
  const accentColor = accent ?? '#2563eb';
  const headingBorder = template === 'modern'
    ? `border-left: 3px solid ${accentColor}; padding-left: 8px;`
    : template === 'minimal'
    ? 'font-weight: 500; letter-spacing: 0.05em; text-transform: uppercase; font-size: 0.75em;'
    : `border-bottom: 1.5px solid ${accentColor}; padding-bottom: 2px;`;

  return `
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
html, body { width: 100%; }
body {
  font-family: ${fontStack(font ?? 'inter')};
  font-size: ${fontSizeBase(fontSize ?? 'normal')};
  color: #1a1a1a;
  background: #fff;
  line-height: 1.5;
  -webkit-print-color-adjust: exact;
  print-color-adjust: exact;
}
@page {
  size: ${(resume.theme.pageSize ?? 'a4') === 'letter' ? 'letter' : 'A4'};
  margin: 18mm 16mm;
}
.resume-wrapper { max-width: 760px; margin: 0 auto; padding: 0; }
a { color: ${accentColor}; text-decoration: none; }
a:hover { text-decoration: underline; }

/* Contact header */
.contact-header { margin-bottom: 14px; }
.contact-name { font-size: 1.8em; font-weight: 700; color: #111; line-height: 1.2; }
.contact-links { margin-top: 4px; font-size: 0.9em; color: #444; }
.contact-links .sep { color: #bbb; }

/* Sections */
.resume-section {
  margin-bottom: 14px;
  page-break-inside: avoid;
}
.section-heading {
  font-size: 1em;
  font-weight: 700;
  color: ${template === 'minimal' ? '#666' : '#111'};
  margin-bottom: 6px;
  ${headingBorder}
}

/* Entries */
.entry {
  margin-bottom: 8px;
  page-break-inside: avoid;
}
.entry-header {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  gap: 8px;
}
.entry-left { flex: 1; min-width: 0; }
.entry-right { flex-shrink: 0; text-align: right; font-size: 0.85em; color: #555; }
.entry-title { font-weight: 600; color: #111; }
.entry-sub { color: #555; }
.entry-date { display: block; }
.entry-location { display: block; }
.entry-desc { margin-top: 3px; color: #333; font-size: 0.95em; }

/* Skills */
.skills-grid { display: flex; flex-direction: column; gap: 3px; }
.skill-row { font-size: 0.95em; }
.skill-cat { font-weight: 600; color: #111; }
.skill-names { color: #333; }

/* Tags */
.tags { display: flex; flex-wrap: wrap; gap: 4px; margin-top: 4px; }
.tag {
  font-size: 0.78em;
  background: #f1f5f9;
  color: #475569;
  padding: 1px 6px;
  border-radius: 3px;
  border: 1px solid #e2e8f0;
}

/* Summary */
.summary-text { color: #333; font-size: 0.95em; }
`;
}

// ─── Public API ───────────────────────────────────────────────────────────────

export function renderResumeToHtml(resume: Resume): string {
  const orderedSections = resume.layout.sectionsOrder
    .map(id => resume.sections.find(s => s.id === id))
    .filter((s): s is ResumeSection => s !== undefined);

  // Include sections not in order at the end
  const inOrder = new Set(resume.layout.sectionsOrder);
  const remaining = resume.sections.filter(s => !inOrder.has(s.id));
  const allSections = [...orderedSections, ...remaining];

  const contactSection = allSections.find(s => s.type === 'contact') as ResumeContactSection | undefined;
  const name = contactSection?.data.name ?? resume.title ?? 'Resume';

  const body = allSections.map(renderSection).join('\n');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${esc(name)}</title>
  <style>${buildCss(resume)}</style>
</head>
<body>
  <div class="resume-wrapper">
    ${body}
  </div>
</body>
</html>`;
}
