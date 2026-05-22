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
  ResumeTheme,
} from '@devfolio/shared';

// ─── Utilities ────────────────────────────────────────────────────────────────

function esc(s: string | undefined | null): string {
  if (!s) return '';
  return s.replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}

function hexToRgba(hex: string, a: number): string {
  const c = hex.replace('#', '');
  return `rgba(${parseInt(c.slice(0,2),16)},${parseInt(c.slice(2,4),16)},${parseInt(c.slice(4,6),16)},${a})`;
}

function fontStack(id: string): string {
  const map: Record<string, string> = {
    inter:        "'Inter', system-ui, sans-serif",
    roboto:       "'Roboto', sans-serif",
    opensans:     "'Open Sans', sans-serif",
    lato:         "'Lato', sans-serif",
    sourcesans:   "'Source Sans 3', sans-serif",
    nunito:       "'Nunito', sans-serif",
    mulish:       "'Mulish', sans-serif",
    karla:        "'Karla', sans-serif",
    worksans:     "'Work Sans', sans-serif",
    barlow:       "'Barlow', sans-serif",
    firasans:     "'Fira Sans', sans-serif",
    jost:         "'Jost', sans-serif",
    ibmplexsans:  "'IBM Plex Sans', sans-serif",
    rubik:        "'Rubik', sans-serif",
    raleway:      "'Raleway', sans-serif",
    asap:         "'Asap', sans-serif",
    georgia:      "Georgia, serif",
    lora:         "'Lora', serif",
    merriweather: "'Merriweather', serif",
    playfair:     "'Playfair Display', serif",
    garamond:     "'EB Garamond', serif",
    jetbrains:    "'JetBrains Mono', monospace",
    firacode:     "'Fira Code', monospace",
    ibmplexmono:  "'IBM Plex Mono', monospace",
  };
  return map[id] ?? map['inter'];
}

function googleFontUrl(id: string): string | null {
  const map: Record<string, [string, string]> = {
    roboto:       ['Roboto',           '300;400;500;700'],
    opensans:     ['Open+Sans',        '300;400;600;700'],
    lato:         ['Lato',             '300;400;700'],
    sourcesans:   ['Source+Sans+3',    '300;400;500;600;700'],
    nunito:       ['Nunito',           '300;400;500;600;700'],
    mulish:       ['Mulish',           '300;400;500;600;700'],
    karla:        ['Karla',            '300;400;500;600;700'],
    worksans:     ['Work+Sans',        '300;400;500;600;700'],
    barlow:       ['Barlow',           '300;400;500;600;700'],
    firasans:     ['Fira+Sans',        '300;400;500;600;700'],
    jost:         ['Jost',             '300;400;500;600;700'],
    ibmplexsans:  ['IBM+Plex+Sans',    '300;400;500;600;700'],
    rubik:        ['Rubik',            '300;400;500;600;700'],
    raleway:      ['Raleway',          '300;400;500;600;700'],
    asap:         ['Asap',             '400;500;600;700'],
    lora:         ['Lora',             '400;500;600;700'],
    merriweather: ['Merriweather',     '300;400;700'],
    playfair:     ['Playfair+Display', '400;500;600;700;800'],
    garamond:     ['EB+Garamond',      '400;500;600;700'],
    jetbrains:    ['JetBrains+Mono',   '300;400;500;700'],
    firacode:     ['Fira+Code',        '300;400;500;700'],
    ibmplexmono:  ['IBM+Plex+Mono',    '300;400;500;700'],
  };
  const e = map[id];
  if (!e) return null;
  return `https://fonts.googleapis.com/css2?family=${e[0]}:wght@${e[1]}&display=swap`;
}

// ─── Contact icons (inline SVG, safe for HTML/PDF) ────────────────────────────

const ICONS: Record<string, string> = {
  email:    `<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>`,
  phone:    `<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.15 13a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.06 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 21 16.92z"/></svg>`,
  location: `<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>`,
  website:  `<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>`,
  linkedin: `<svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6zM2 9h4v12H2z"/><circle cx="4" cy="4" r="2"/></svg>`,
  github:   `<svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"/></svg>`,
};

function icon(type: string, color: string): string {
  const svg = ICONS[type];
  if (!svg) return '';
  return `<span style="color:${color};display:inline-flex;align-items:center;margin-right:3px;vertical-align:middle">${svg}</span>`;
}

// ─── HTML rendering utilities ─────────────────────────────────────────────────

function renderHtmlContent(html: string, fontSize: number): string {
  if (!html) return '';
  const isRich = /<[a-z][\s\S]*>/i.test(html);
  if (!isRich) {
    const lines = html.split('\n').map(l => l.replace(/^[•\-*]\s*/,'').trim()).filter(Boolean);
    if (lines.length <= 1) return `<p style="margin:0;font-size:${fontSize}px;color:#333;line-height:1.55">${esc(html)}</p>`;
    return `<ul style="margin:4px 0 0;padding-left:14px;list-style-type:disc;font-size:${fontSize}px">
      ${lines.map(l => `<li style="margin-bottom:2px;color:#2d2d2d;line-height:1.55">${esc(l)}</li>`).join('')}
    </ul>`;
  }
  // HTML content — render directly (user's own content)
  return `<div style="font-size:${fontSize}px;color:#333;line-height:1.55;margin-top:4px">${html}</div>`;
}

function techTags(tags: string[], accent: string, base: number): string {
  if (!tags.length) return '';
  const pills = tags.map(t =>
    `<span style="font-size:${base * 0.78}px;padding:1px 7px;border-radius:3px;background:${hexToRgba(accent,0.08)};color:${accent};border:1px solid ${hexToRgba(accent,0.22)};font-weight:500;line-height:1.6">${esc(t)}</span>`
  ).join('');
  return `<div style="display:flex;flex-wrap:wrap;gap:3px 5px;margin-top:5px">${pills}</div>`;
}

// ─── Heading style renderer ───────────────────────────────────────────────────

type HStyle = ResumeTheme['headingStyle'];
type HSize  = ResumeTheme['headingSize'];
type HCase  = ResumeTheme['headingCase'];
type HAlign = ResumeTheme['headingAlign'];

function applyCase(text: string, c: HCase): string {
  if (c === 'uppercase')  return text.toUpperCase();
  if (c === 'capitalize') return text.replace(/\b\w/g, ch => ch.toUpperCase());
  return text;
}

function hSizeMult(sz: HSize): number {
  return { xs: 0.72, s: 0.80, m: 0.90, l: 1.0 }[sz ?? 's'] ?? 0.80;
}

function sectionHeading(text: string, base: number, accent: string, hStyle: HStyle, hSize: HSize, hCase: HCase, hAlign: HAlign): string {
  const label = applyCase(text, hCase ?? 'uppercase');
  const fs = base * hSizeMult(hSize);
  const align = hAlign ?? 'left';
  const base_s = `font-size:${fs}px;font-weight:800;line-height:1.2;text-align:${align};`;

  switch (hStyle) {
    case 'underline':
      return `<div style="${base_s}color:#111;border-bottom:2px solid ${accent};padding-bottom:3px;margin-bottom:10px;margin-top:2px">${label}</div>`;
    case 'overline':
      return `<div style="${base_s}color:#111;border-top:2px solid ${accent};padding-top:3px;margin-bottom:10px;margin-top:4px">${label}</div>`;
    case 'filled':
      return `<div style="${base_s}color:#fff;background:${accent};padding:3px 8px;margin-bottom:10px;margin-top:2px">${label}</div>`;
    case 'leftbar':
      return `<div style="${base_s}color:#111;border-left:3px solid ${accent};padding-left:8px;margin-bottom:10px;margin-top:2px">${label}</div>`;
    case 'simple':
      return `<div style="${base_s}color:#111;margin-bottom:10px;margin-top:2px">${label}</div>`;
    case 'double':
      return `<div style="${base_s}color:#111;border-bottom:1px solid ${accent};padding-bottom:2px;margin-bottom:10px;margin-top:2px">${label}<div style="border-bottom:1px solid ${hexToRgba(accent,0.35)};margin-top:2px"></div></div>`;
    case 'dashed':
      return `<div style="${base_s}color:#111;border-bottom:1.5px dashed ${accent};padding-bottom:3px;margin-bottom:10px;margin-top:2px">${label}</div>`;
    case 'none':
      return `<div style="${base_s}color:#555;margin-bottom:10px;margin-top:2px">${label}</div>`;
    default:
      return `<div style="${base_s}color:#111;border-bottom:2px solid ${accent};padding-bottom:3px;margin-bottom:10px;margin-top:2px">${label}</div>`;
  }
}

// ─── Contact header variants ──────────────────────────────────────────────────

function renderContactInfo(d: ResumeContactSection['data'], accent: string, _base: number): string {
  const items: Array<{ type: string; href?: string; display: string }> = [];
  if (d.email)    items.push({ type: 'email',    href: `mailto:${d.email}`,   display: esc(d.email) });
  if (d.phone)    items.push({ type: 'phone',    display: esc(d.phone) });
  if (d.location) items.push({ type: 'location', display: esc(d.location) });
  if (d.website)  items.push({ type: 'website',  href: d.website, display: esc(d.website.replace(/^https?:\/\//,'')) });
  if (d.linkedin) items.push({ type: 'linkedin', href: d.linkedin, display: esc(d.linkedin.replace(/^https?:\/\/(www\.)?linkedin\.com\/in\/?/,'')) });
  if (d.github)   items.push({ type: 'github',   href: d.github, display: esc(d.github.replace(/^https?:\/\/(www\.)?github\.com\//,'')) });
  return items.map(l =>
    `<span style="display:inline-flex;align-items:center;gap:3px">${icon(l.type,accent)}${l.href ? `<a href="${esc(l.href)}" style="color:inherit;text-decoration:none">${l.display}</a>` : l.display}</span>`
  ).join('');
}

function renderExtraDetails(d: ResumeContactSection['data']): string {
  const extra: string[] = [];
  if (d.dob)           extra.push(`DOB: ${esc(d.dob)}`);
  if (d.nationality)   extra.push(esc(d.nationality));
  if (d.maritalStatus) extra.push(esc(d.maritalStatus));
  if (d.availability)  extra.push(`Available: ${esc(d.availability)}`);
  return extra.join('  ·  ');
}

function photoEl(photo: string, shape?: string, size = 72): string {
  const radius = shape === 'square' ? '4px' : shape === 'rounded' ? '12px' : '50%';
  return `<img src="${photo}" width="${size}" height="${size}" style="width:${size}px;height:${size}px;object-fit:cover;border-radius:${radius};border:2px solid rgba(0,0,0,0.08);flex-shrink:0" />`;
}

function renderContact(s: ResumeContactSection, template: string, accent: string, base: number): string {
  const d = s.data;
  const align = d.nameAlign ?? 'center';
  const info  = renderContactInfo(d, accent, base);
  const extra = renderExtraDetails(d);
  const photo = d.photo ? photoEl(d.photo, d.photoShape) : '';
  const photoR = d.photoPosition !== 'left';

  const namePart = `
    <div style="font-size:${base * 2}px;font-weight:800;color:#0f172a;letter-spacing:-0.5px;line-height:1.15">${esc(d.name) || 'Your Name'}</div>
    ${d.title ? `<div style="font-size:${base * 1.05}px;color:${accent};margin-top:4px;font-weight:500">${esc(d.title)}</div>` : ''}
  `;

  if (template === 'minimal') {
    return `
<header style="margin-bottom:20px">
  <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:16px">
    <div style="display:flex;gap:${photo ? '12px' : '0'};align-items:flex-start;flex-direction:${photo && !photoR ? 'row' : 'row'}">
      ${photo && !photoR ? photo : ''}
      <div>
        ${namePart}
        ${d.title ? '' : ''}
      </div>
    </div>
    <div style="display:flex;gap:12px;align-items:flex-start;flex-direction:row-reverse">
      ${photo && photoR ? photo : ''}
      <div style="text-align:right;font-size:${base * 0.86}px;color:#555;line-height:1.75">
        ${renderContactInfo(d, accent, base).split('</span>').map(s => s ? `<div style="display:flex;align-items:center;gap:3px;justify-content:flex-end">${s}</span></div>` : '').filter(Boolean).join('')}
      </div>
    </div>
  </div>
  ${extra ? `<div style="margin-top:5px;font-size:${base * 0.82}px;color:#718096">${extra}</div>` : ''}
  <div style="border-top:1px solid #ccc;margin-top:12px"></div>
</header>`;
  }

  if (template === 'modern') {
    return `
<header style="margin-bottom:18px;padding-bottom:14px;border-bottom:2.5px solid ${accent}">
  <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:12px">
    <div style="display:flex;gap:14px;align-items:flex-start">
      ${photo && !photoR ? photo : ''}
      <div style="flex:1">${namePart}</div>
    </div>
    <div style="display:flex;gap:12px;align-items:flex-start">
      <div style="text-align:right;font-size:${base * 0.86}px;color:#4a5568;line-height:1.75;margin-top:3px">
        ${[d.email,d.phone,d.location].filter(Boolean).map((v,i) => {
          const types = ['email','phone','location'];
          const hrefs = [d.email ? `mailto:${d.email}` : undefined, undefined, undefined];
          return `<div style="display:flex;align-items:center;gap:3px;justify-content:flex-end">${icon(types[i],accent)}${hrefs[i] ? `<a href="${esc(hrefs[i])}" style="color:inherit;text-decoration:none">${esc(v!)}</a>` : esc(v!)}</div>`;
        }).join('')}
      </div>
      ${photo && photoR ? photo : ''}
    </div>
  </div>
  ${[d.website,d.linkedin,d.github].filter(Boolean).length || extra ? `
  <div style="margin-top:8px;display:flex;gap:14px;font-size:${base * 0.86}px;flex-wrap:wrap;color:#4a5568">
    ${d.website ? `<span style="display:inline-flex;align-items:center;gap:3px">${icon('website',accent)}<a href="${esc(d.website)}" style="color:${accent};text-decoration:none">${esc(d.website.replace(/^https?:\/\//,''))}</a></span>` : ''}
    ${d.linkedin ? `<span style="display:inline-flex;align-items:center;gap:3px">${icon('linkedin',accent)}<a href="${esc(d.linkedin)}" style="color:${accent};text-decoration:none">${esc(d.linkedin.replace(/^https?:\/\/(www\.)?linkedin\.com\/in\/?/,''))}</a></span>` : ''}
    ${d.github ? `<span style="display:inline-flex;align-items:center;gap:3px">${icon('github',accent)}<a href="${esc(d.github)}" style="color:${accent};text-decoration:none">${esc(d.github.replace(/^https?:\/\/(www\.)?github\.com\//,''))}</a></span>` : ''}
    ${extra ? `<span style="color:#718096">${extra}</span>` : ''}
  </div>` : ''}
</header>`;
  }

  // classic
  return `
<header style="text-align:${photo ? 'left' : align};margin-bottom:18px;padding-bottom:14px;border-bottom:1px solid #e2e8f0">
  ${photo ? `<div style="display:flex;gap:16px;align-items:flex-start;flex-direction:${photoR ? 'row-reverse' : 'row'}">
    ${photo}
    <div style="flex:1;text-align:left">
      ${namePart}
      ${info ? `<div style="margin-top:8px;display:flex;flex-wrap:wrap;gap:2px 12px;font-size:${base * 0.86}px;color:#4a5568">${info}</div>` : ''}
      ${extra ? `<div style="margin-top:4px;font-size:${base * 0.82}px;color:#718096">${extra}</div>` : ''}
    </div>
  </div>` : `
    ${namePart}
    ${info ? `<div style="margin-top:8px;display:flex;flex-wrap:wrap;justify-content:${align === 'center' ? 'center' : 'flex-start'};gap:2px 12px;font-size:${base * 0.86}px;color:#4a5568">${info}</div>` : ''}
    ${extra ? `<div style="margin-top:4px;font-size:${base * 0.82}px;color:#718096">${extra}</div>` : ''}
  `}
</header>`;
}

// ─── Body section renderers ───────────────────────────────────────────────────

function renderSummary(s: ResumeSummarySection, base: number, accent: string, hStyle: HStyle, hSize: HSize, hCase: HCase, hAlign: HAlign): string {
  if (!s.data.text) return '';
  return `
<section style="margin-bottom:16px">
  ${sectionHeading(s.data.heading, base, accent, hStyle, hSize, hCase, hAlign)}
  ${renderHtmlContent(s.data.text, base * 0.96)}
</section>`;
}

function renderExperience(s: ResumeExperienceSection, base: number, accent: string, entrySpacing: number, hStyle: HStyle, hSize: HSize, hCase: HCase, hAlign: HAlign): string {
  if (!s.data.items.length) return '';
  const items = s.data.items.map(item => `
<div style="margin-bottom:${entrySpacing}px;page-break-inside:avoid">
  <div style="display:flex;justify-content:space-between;align-items:baseline;gap:8px">
    <div style="flex:1;min-width:0">
      <span style="font-weight:700;font-size:${base}px;color:#111">${esc(item.role)}</span>
      ${item.company ? `<span style="color:#555;font-style:italic;font-size:${base * 0.96}px"> · ${esc(item.company)}</span>` : ''}
    </div>
    <div style="font-size:${base * 0.84}px;color:#666;text-align:right;flex-shrink:0">
      ${item.startDate ? `<span>${esc(item.startDate)}${item.current ? ' – Present' : item.endDate ? ` – ${esc(item.endDate)}` : ''}</span>` : ''}
      ${item.location ? `<div style="color:#888;font-size:${base * 0.82}px">${esc(item.location)}</div>` : ''}
    </div>
  </div>
  ${item.description ? renderHtmlContent(item.description, base * 0.95) : ''}
  ${item.highlights?.length ? techTags(item.highlights, accent, base) : ''}
</div>`).join('');
  return `
<section style="margin-bottom:16px;page-break-inside:avoid">
  ${sectionHeading(s.data.heading, base, accent, hStyle, hSize, hCase, hAlign)}
  ${items}
</section>`;
}

function renderEducation(s: ResumeEducationSection, base: number, accent: string, entrySpacing: number, hStyle: HStyle, hSize: HSize, hCase: HCase, hAlign: HAlign): string {
  if (!s.data.items.length) return '';
  const items = s.data.items.map(item => `
<div style="margin-bottom:${entrySpacing * 0.8}px">
  <div style="display:flex;justify-content:space-between;align-items:baseline;gap:8px">
    <div style="flex:1">
      <span style="font-weight:700;font-size:${base}px;color:#111">${esc(item.degree)}${item.field ? `, ${esc(item.field)}` : ''}</span>
      ${item.institution ? `<span style="color:#555;font-style:italic;font-size:${base * 0.96}px"> · ${esc(item.institution)}</span>` : ''}
    </div>
    <div style="font-size:${base * 0.84}px;color:#666;flex-shrink:0">
      ${item.startDate ? `<span>${esc(item.startDate)}${item.endDate ? ` – ${esc(item.endDate)}` : ''}</span>` : ''}
      ${item.gpa ? `<div style="color:#888">GPA: ${esc(item.gpa)}</div>` : ''}
    </div>
  </div>
  ${item.description ? renderHtmlContent(item.description, base * 0.92) : ''}
</div>`).join('');
  return `
<section style="margin-bottom:16px">
  ${sectionHeading(s.data.heading, base, accent, hStyle, hSize, hCase, hAlign)}
  ${items}
</section>`;
}

function renderSkills(s: ResumeSkillsSection, base: number, accent: string, hStyle: HStyle, hSize: HSize, hCase: HCase, hAlign: HAlign): string {
  if (!s.data.items.length) return '';
  const cats = new Map<string, string[]>();
  for (const sk of s.data.items) {
    const c = sk.category || 'Skills';
    if (!cats.has(c)) cats.set(c, []);
    cats.get(c)!.push(sk.name);
  }
  const rows = Array.from(cats.entries()).map(([cat, names]) =>
    `<div style="font-size:${base * 0.96}px;line-height:1.5;margin-bottom:3px"><span style="font-weight:700;color:#111">${esc(cat)}:</span> <span style="color:#333">${names.map(esc).join(', ')}</span></div>`
  ).join('');
  return `
<section style="margin-bottom:16px">
  ${sectionHeading(s.data.heading, base, accent, hStyle, hSize, hCase, hAlign)}
  ${rows}
</section>`;
}

function renderProjects(s: ResumeProjectsSection, base: number, accent: string, entrySpacing: number, hStyle: HStyle, hSize: HSize, hCase: HCase, hAlign: HAlign): string {
  if (!s.data.items.length) return '';
  const items = s.data.items.map(item => `
<div style="margin-bottom:${entrySpacing}px;page-break-inside:avoid">
  <div style="font-weight:700;font-size:${base}px;color:${item.liveUrl ? accent : '#111'}">
    ${item.liveUrl ? `<a href="${esc(item.liveUrl)}" style="color:${accent};text-decoration:none">${esc(item.title)}</a>` : esc(item.title)}
  </div>
  ${item.description ? renderHtmlContent(item.description, base * 0.95) : ''}
  ${item.tags?.length ? techTags(item.tags, accent, base) : ''}
</div>`).join('');
  return `
<section style="margin-bottom:16px;page-break-inside:avoid">
  ${sectionHeading(s.data.heading, base, accent, hStyle, hSize, hCase, hAlign)}
  ${items}
</section>`;
}

function renderCertifications(s: ResumeCertificationsSection, base: number, accent: string, hStyle: HStyle, hSize: HSize, hCase: HCase, hAlign: HAlign): string {
  if (!s.data.items.length) return '';
  const items = s.data.items.map((item: typeof s.data.items[0]) => `
<div style="margin-bottom:7px">
  <div style="display:flex;justify-content:space-between;align-items:baseline;gap:8px">
    <div>
      <span style="font-weight:700;color:${item.url ? accent : '#111'};font-size:${base * 0.98}px">
        ${item.url ? `<a href="${esc(item.url)}" style="color:${accent};text-decoration:none">${esc(item.name)}</a>` : esc(item.name)}
      </span>
      ${item.issuer ? `<span style="color:#555;font-style:italic;font-size:${base * 0.93}px"> · ${esc(item.issuer)}</span>` : ''}
    </div>
    ${item.date ? `<span style="font-size:${base * 0.84}px;color:#666;flex-shrink:0">${esc(item.date)}</span>` : ''}
  </div>
  ${item.credentialId ? `<div style="font-size:${base * 0.82}px;color:#888;margin-top:1px">ID: ${esc(item.credentialId)}</div>` : ''}
</div>`).join('');
  return `
<section style="margin-bottom:16px">
  ${sectionHeading(s.data.heading, base, accent, hStyle, hSize, hCase, hAlign)}
  ${items}
</section>`;
}

function renderSection(section: ResumeSection, base: number, accent: string, entrySpacing: number, hStyle: HStyle, hSize: HSize, hCase: HCase, hAlign: HAlign): string {
  if (!section.visible) return '';
  switch (section.type) {
    case 'contact':        return '';
    case 'summary':        return renderSummary(section, base, accent, hStyle, hSize, hCase, hAlign);
    case 'experience':     return renderExperience(section, base, accent, entrySpacing, hStyle, hSize, hCase, hAlign);
    case 'education':      return renderEducation(section, base, accent, entrySpacing, hStyle, hSize, hCase, hAlign);
    case 'skills':         return renderSkills(section, base, accent, hStyle, hSize, hCase, hAlign);
    case 'projects':       return renderProjects(section, base, accent, entrySpacing, hStyle, hSize, hCase, hAlign);
    case 'certifications': return renderCertifications(section, base, accent, hStyle, hSize, hCase, hAlign);
    default:               return '';
  }
}

// ─── CSS ──────────────────────────────────────────────────────────────────────

function buildCss(r: Resume, base: number, marginH: number, marginV: number): string {
  const furl = googleFontUrl(r.theme.font ?? 'inter');
  const fimport = furl ? `@import url('${furl}');` : '';
  // Convert px margins to mm for @page (1mm ≈ 3.7795px)
  const mhMm = Math.round(marginH / 3.78);
  const mvMm = Math.round(marginV / 3.78);

  return `${fimport}
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
html,body{width:100%}
body{
  font-family:${fontStack(r.theme.font ?? 'inter')};
  font-size:${base}px;
  color:#1a1a1a;
  background:#fff;
  line-height:${r.theme.lineHeight ?? 1.55};
  -webkit-print-color-adjust:exact;
  print-color-adjust:exact;
}
@page{
  size:${(r.theme.pageSize ?? 'a4') === 'letter' ? 'letter' : 'A4'};
  margin:${mvMm}mm ${mhMm}mm;
}
a{color:inherit;text-decoration:none}
ul{list-style-type:disc;padding-left:14px}
ol{list-style-type:decimal;padding-left:14px}
li{margin-bottom:2px;line-height:1.55}
`;
}

// ─── Public API ───────────────────────────────────────────────────────────────

export function renderResumeToHtml(resume: Resume): string {
  const {
    accent       = '#2563eb',
    template     = 'classic',
    fontSize     = 11.5,
    marginH      = 52,
    marginV      = 48,
    entrySpacing = 11,
    headingStyle = 'underline',
    headingSize  = 's',
    headingCase  = 'uppercase',
    headingAlign = 'left',
  } = resume.theme;

  const base = fontSize;
  const hStyle = headingStyle as HStyle;
  const hSize  = headingSize as HSize;
  const hCase  = headingCase as HCase;
  const hAlign = headingAlign as HAlign;

  const orderedSections = [
    ...resume.layout.sectionsOrder.map((id: string) => resume.sections.find((s: ResumeSection) => s.id === id)).filter((s): s is ResumeSection => !!s),
    ...resume.sections.filter((sec: ResumeSection) => !resume.layout.sectionsOrder.includes(sec.id)),
  ];

  const contact = orderedSections.find(s => s.type === 'contact') as ResumeContactSection | undefined;
  const name = contact?.data.name ?? resume.title ?? 'Resume';

  const contactHtml = contact ? renderContact(contact, template, accent, base) : '';
  const bodyHtml    = orderedSections.map(s => renderSection(s, base, accent, entrySpacing, hStyle, hSize, hCase, hAlign)).join('');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1.0"/>
  <title>${esc(name)}</title>
  <style>${buildCss(resume, base, marginH, marginV)}</style>
</head>
<body>
  <div style="max-width:760px;margin:0 auto;padding:${marginV}px ${marginH}px">
    ${contactHtml}
    ${bodyHtml}
  </div>
</body>
</html>`;
}
