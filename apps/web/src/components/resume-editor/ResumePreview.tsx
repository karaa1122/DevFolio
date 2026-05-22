'use client';

import React, { useEffect, CSSProperties } from 'react';
import { useResumeStore } from '@/store/resume.store';
import type {
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
import { getFontCss, getGoogleFontUrl } from '@/lib/resume-fonts';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function hexToRgba(hex: string, alpha: number): string {
  const c = hex.replace('#', '');
  return `rgba(${parseInt(c.slice(0,2),16)},${parseInt(c.slice(2,4),16)},${parseInt(c.slice(4,6),16)},${alpha})`;
}

/** Render HTML content from rich text editor (or plain text) */
function HtmlContent({ html, style }: { html: string; style?: CSSProperties }) {
  if (!html) return null;
  // If it's plain text with no HTML tags, render with bullet-point conversion
  const isRich = /<[a-z][\s\S]*>/i.test(html);
  if (!isRich) {
    const lines = html.split('\n').map(l => l.replace(/^[•\-*]\s*/,'').trim()).filter(Boolean);
    if (lines.length <= 1) {
      return <p style={{ margin: 0, ...style }}>{html}</p>;
    }
    return (
      <ul style={{ margin: '4px 0 0', paddingLeft: 14, listStyleType: 'disc', ...style }}>
        {lines.map((l, i) => <li key={i} style={{ marginBottom: 2, lineHeight: 1.55 }}>{l}</li>)}
      </ul>
    );
  }
  return (
    <div
      style={{ margin: 0, ...style }}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}

function TechTags({ tags, accent, base }: { tags: string[]; accent: string; base: number }) {
  if (!tags.length) return null;
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '3px 5px', marginTop: 5 }}>
      {tags.map(tag => (
        <span key={tag} style={{
          fontSize: base * 0.78,
          padding: '1px 7px',
          borderRadius: 3,
          background: hexToRgba(accent, 0.08),
          color: accent,
          border: `1px solid ${hexToRgba(accent, 0.22)}`,
          fontWeight: 500,
          lineHeight: 1.6,
        }}>{tag}</span>
      ))}
    </div>
  );
}

// ─── Contact icons (inline SVG strings rendered via dangerouslySetInnerHTML) ──

const ICONS: Record<string, string> = {
  email: `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>`,
  phone: `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.15 13a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.06 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L7.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 21 16.92z"/></svg>`,
  location: `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>`,
  website: `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>`,
  linkedin: `<svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6zM2 9h4v12H2z"/><circle cx="4" cy="4" r="2"/></svg>`,
  github: `<svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"/></svg>`,
};

function ContactIcon({ type, color }: { type: string; color: string }) {
  const svg = ICONS[type];
  if (!svg) return null;
  return (
    <span
      style={{ color, display: 'inline-flex', alignItems: 'center', marginRight: 3, verticalAlign: 'middle' }}
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
}

// ─── Section heading renderer ─────────────────────────────────────────────────

type TemplateId = 'classic' | 'modern' | 'minimal';
type HeadingStyle = ResumeTheme['headingStyle'];
type HeadingSize = ResumeTheme['headingSize'];
type HeadingCase = ResumeTheme['headingCase'];
type HeadingAlign = ResumeTheme['headingAlign'];

function applyCase(text: string, hCase: HeadingCase): string {
  if (hCase === 'uppercase') return text.toUpperCase();
  if (hCase === 'capitalize') return text.replace(/\b\w/g, c => c.toUpperCase());
  return text;
}

function headingSizeMultiplier(sz: HeadingSize): number {
  return { xs: 0.72, s: 0.80, m: 0.90, l: 1.0 }[sz ?? 's'] ?? 0.80;
}

function SectionHeading({
  text, accent, base,
  hStyle, hSize, hCase, hAlign,
  template,
}: {
  text: string; accent: string; base: number;
  hStyle: HeadingStyle; hSize: HeadingSize; hCase: HeadingCase; hAlign: HeadingAlign;
  template: TemplateId;
}) {
  const label = applyCase(text, hCase ?? 'uppercase');
  const fontSize = base * headingSizeMultiplier(hSize);
  const textAlign = hAlign ?? 'left';

  // Effective style: if user chose a style, use it; otherwise use template default
  const effectiveStyle = hStyle ?? (template === 'modern' ? 'leftbar' : template === 'minimal' ? 'simple' : 'underline');

  const base_style: CSSProperties = {
    fontSize,
    fontWeight: 800,
    marginBottom: 10,
    marginTop: 2,
    lineHeight: 1.2,
    textAlign,
  };

  switch (effectiveStyle) {
    case 'underline':
      return (
        <div style={{ ...base_style, color: '#111', borderBottom: `2px solid ${accent}`, paddingBottom: 3 }}>
          {label}
        </div>
      );
    case 'overline':
      return (
        <div style={{ ...base_style, color: '#111', borderTop: `2px solid ${accent}`, paddingTop: 3, marginTop: 4 }}>
          {label}
        </div>
      );
    case 'filled':
      return (
        <div style={{
          ...base_style,
          color: '#fff',
          background: accent,
          paddingLeft: 8,
          paddingRight: 8,
          paddingTop: 3,
          paddingBottom: 3,
          marginLeft: textAlign === 'left' ? -8 : 0,
          display: textAlign === 'center' ? 'flex' : 'block',
          justifyContent: 'center',
        }}>
          {label}
        </div>
      );
    case 'leftbar':
      return (
        <div style={{ ...base_style, color: '#111', borderLeft: `3px solid ${accent}`, paddingLeft: 8 }}>
          {label}
        </div>
      );
    case 'simple':
      return (
        <div style={{ ...base_style, color: '#111' }}>{label}</div>
      );
    case 'double':
      return (
        <div style={{ ...base_style, color: '#111', borderBottom: `1px solid ${accent}`, paddingBottom: 2 }}>
          {label}
          <div style={{ borderBottom: `1px solid ${hexToRgba(accent, 0.35)}`, marginTop: 2 }} />
        </div>
      );
    case 'dashed':
      return (
        <div style={{ ...base_style, color: '#111', borderBottom: `1.5px dashed ${accent}`, paddingBottom: 3 }}>
          {label}
        </div>
      );
    case 'none':
      return (
        <div style={{ ...base_style, color: '#555' }}>{label}</div>
      );
    default:
      return (
        <div style={{ ...base_style, color: '#111', borderBottom: `2px solid ${accent}`, paddingBottom: 3 }}>
          {label}
        </div>
      );
  }
}

// ─── Contact header variants ──────────────────────────────────────────────────

interface ContactInfo {
  type: string;
  value: string;
  href?: string;
  display: string;
}

function buildContactLinks(d: ResumeContactSection['data']): ContactInfo[] {
  const items: ContactInfo[] = [];
  if (d.email)    items.push({ type: 'email',    value: d.email,    href: `mailto:${d.email}`,   display: d.email });
  if (d.phone)    items.push({ type: 'phone',    value: d.phone,    display: d.phone });
  if (d.location) items.push({ type: 'location', value: d.location, display: d.location });
  if (d.website)  items.push({ type: 'website',  value: d.website,  href: d.website, display: d.website.replace(/^https?:\/\//, '') });
  if (d.linkedin) items.push({ type: 'linkedin', value: d.linkedin, href: d.linkedin, display: d.linkedin.replace(/^https?:\/\/(www\.)?linkedin\.com\/in\/?/, '') });
  if (d.github)   items.push({ type: 'github',   value: d.github,   href: d.github,  display: d.github.replace(/^https?:\/\/(www\.)?github\.com\//, '') });
  return items;
}

function buildExtraDetails(d: ResumeContactSection['data']): string[] {
  const extra: string[] = [];
  if (d.dob)           extra.push(`DOB: ${d.dob}`);
  if (d.nationality)   extra.push(d.nationality);
  if (d.maritalStatus) extra.push(d.maritalStatus);
  if (d.availability)  extra.push(`Available: ${d.availability}`);
  return extra;
}

function PhotoBlock({ photo, shape, size }: { photo: string; shape?: string; size: number }) {
  const radius = shape === 'square' ? 4 : shape === 'rounded' ? 12 : '50%';
  return (
    <img
      src={photo}
      alt="Profile"
      style={{
        width: size,
        height: size,
        objectFit: 'cover',
        borderRadius: radius,
        flexShrink: 0,
        border: '2px solid rgba(0,0,0,0.08)',
      }}
    />
  );
}

function ClassicContact({ s, accent, base }: { s: ResumeContactSection; accent: string; base: number }) {
  const { name, title, photo, photoShape, photoPosition, nameAlign } = s.data;
  const links = buildContactLinks(s.data);
  const extra = buildExtraDetails(s.data);
  const align = nameAlign ?? 'center';
  const hasPhoto = !!photo;
  const photoSize = 72;

  const nameBlock = (
    <div style={{ flex: 1 }}>
      <div style={{
        fontSize: base * 2.05, fontWeight: 800, color: '#0f172a',
        letterSpacing: '-0.5px', lineHeight: 1.15,
        textAlign: hasPhoto ? 'left' : align,
      }}>{name || 'Your Name'}</div>
      {title && (
        <div style={{ fontSize: base * 1.05, color: accent, marginTop: 4, fontWeight: 500, lineHeight: 1.3, textAlign: hasPhoto ? 'left' : align }}>
          {title}
        </div>
      )}
      {links.length > 0 && (
        <div style={{
          marginTop: 8,
          display: 'flex', flexWrap: 'wrap',
          justifyContent: hasPhoto ? 'flex-start' : (align === 'center' ? 'center' : 'flex-start'),
          gap: '2px 12px',
          fontSize: base * 0.86,
          color: '#4a5568',
        }}>
          {links.map(l => (
            <span key={l.type} style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
              <ContactIcon type={l.type} color={accent} />
              {l.href ? <a href={l.href} style={{ color: 'inherit', textDecoration: 'none' }}>{l.display}</a> : l.display}
            </span>
          ))}
        </div>
      )}
      {extra.length > 0 && (
        <div style={{ marginTop: 5, fontSize: base * 0.82, color: '#718096', display: 'flex', flexWrap: 'wrap', gap: '2px 12px' }}>
          {extra.map(e => <span key={e}>{e}</span>)}
        </div>
      )}
    </div>
  );

  return (
    <div style={{ marginBottom: 18, paddingBottom: 14, borderBottom: '1px solid #e2e8f0' }}>
      {hasPhoto ? (
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16, flexDirection: photoPosition === 'left' ? 'row' : 'row-reverse' }}>
          <PhotoBlock photo={photo!} shape={photoShape} size={photoSize} />
          {nameBlock}
        </div>
      ) : nameBlock}
    </div>
  );
}

function ModernContact({ s, accent, base }: { s: ResumeContactSection; accent: string; base: number }) {
  const { name, title, photo, photoShape, photoPosition } = s.data;
  const links = buildContactLinks(s.data);
  const extra = buildExtraDetails(s.data);
  const email = links.find(l => l.type === 'email');
  const phone = links.find(l => l.type === 'phone');
  const location = links.find(l => l.type === 'location');
  const socials = links.filter(l => !['email','phone','location'].includes(l.type));
  const photoSize = 72;

  return (
    <div style={{ marginBottom: 18, paddingBottom: 14, borderBottom: `2.5px solid ${accent}` }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
        <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start', flex: 1, flexDirection: photo && photoPosition === 'left' ? 'row' : 'row' }}>
          {photo && photoPosition === 'left' && <PhotoBlock photo={photo} shape={photoShape} size={photoSize} />}
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: base * 2, fontWeight: 800, color: '#0f172a', letterSpacing: '-0.5px', lineHeight: 1.15 }}>
              {name || 'Your Name'}
            </div>
            {title && <div style={{ fontSize: base * 1.05, color: accent, marginTop: 4, fontWeight: 500 }}>{title}</div>}
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, flexShrink: 0, flexDirection: photo && photoPosition === 'right' ? 'row-reverse' : 'row' }}>
          {photo && photoPosition === 'right' && <PhotoBlock photo={photo} shape={photoShape} size={photoSize} />}
          <div style={{ textAlign: 'right', fontSize: base * 0.86, color: '#4a5568', lineHeight: 1.75, marginTop: 3 }}>
            {email && <div style={{ display: 'flex', alignItems: 'center', gap: 4, justifyContent: 'flex-end' }}><ContactIcon type="email" color={accent} /><a href={`mailto:${email.value}`} style={{ color: 'inherit', textDecoration: 'none' }}>{email.display}</a></div>}
            {phone && <div style={{ display: 'flex', alignItems: 'center', gap: 4, justifyContent: 'flex-end' }}><ContactIcon type="phone" color={accent} />{phone.display}</div>}
            {location && <div style={{ display: 'flex', alignItems: 'center', gap: 4, justifyContent: 'flex-end' }}><ContactIcon type="location" color={accent} />{location.display}</div>}
          </div>
        </div>
      </div>
      {(socials.length > 0 || extra.length > 0) && (
        <div style={{ marginTop: 8, display: 'flex', gap: 14, fontSize: base * 0.86, flexWrap: 'wrap', color: '#4a5568' }}>
          {socials.map(l => (
            <span key={l.type} style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
              <ContactIcon type={l.type} color={accent} />
              {l.href ? <a href={l.href} style={{ color: accent, textDecoration: 'none' }}>{l.display}</a> : l.display}
            </span>
          ))}
          {extra.map(e => <span key={e} style={{ color: '#718096' }}>{e}</span>)}
        </div>
      )}
    </div>
  );
}

function MinimalContact({ s, accent, base }: { s: ResumeContactSection; accent: string; base: number }) {
  const { name, title, photo, photoShape, photoPosition } = s.data;
  const links = buildContactLinks(s.data);
  const extra = buildExtraDetails(s.data);
  const right = links.filter(l => ['email','phone','location'].includes(l.type));
  const socials = links.filter(l => !['email','phone','location'].includes(l.type));
  const photoSize = 64;

  return (
    <div style={{ marginBottom: 20 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16 }}>
        <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start', flex: 1, flexDirection: photo && photoPosition === 'left' ? 'row' : 'row' }}>
          {photo && photoPosition === 'left' && <PhotoBlock photo={photo} shape={photoShape} size={photoSize} />}
          <div>
            <div style={{ fontSize: base * 1.95, fontWeight: 800, color: '#111', letterSpacing: '-0.5px', lineHeight: 1.15 }}>
              {name || 'Your Name'}
            </div>
            {title && <div style={{ fontSize: base, color: '#666', fontStyle: 'italic', marginTop: 2 }}>{title}</div>}
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, flexShrink: 0 }}>
          {photo && photoPosition === 'right' && <PhotoBlock photo={photo} shape={photoShape} size={photoSize} />}
          <div style={{ textAlign: 'right', fontSize: base * 0.86, color: '#555', lineHeight: 1.75 }}>
            {right.map(l => (
              <div key={l.type} style={{ display: 'flex', alignItems: 'center', gap: 3, justifyContent: 'flex-end' }}>
                <ContactIcon type={l.type} color={accent} />
                {l.href ? <a href={l.href} style={{ color: 'inherit', textDecoration: 'none' }}>{l.display}</a> : l.display}
              </div>
            ))}
          </div>
        </div>
      </div>
      {(socials.length > 0 || extra.length > 0) && (
        <div style={{ marginTop: 6, display: 'flex', gap: 14, fontSize: base * 0.84, flexWrap: 'wrap' }}>
          {socials.map(l => (
            <span key={l.type} style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
              <ContactIcon type={l.type} color={accent} />
              {l.href ? <a href={l.href} style={{ color: accent, textDecoration: 'none' }}>{l.display}</a> : l.display}
            </span>
          ))}
          {extra.map(e => <span key={e} style={{ color: '#718096' }}>{e}</span>)}
        </div>
      )}
      <div style={{ borderTop: '1px solid #ccc', marginTop: 12 }} />
    </div>
  );
}

// ─── Section renderers ────────────────────────────────────────────────────────

interface HeadingProps {
  text: string; accent: string; base: number;
  hStyle: HeadingStyle; hSize: HeadingSize; hCase: HeadingCase; hAlign: HeadingAlign;
  template: TemplateId;
}

function SummaryView({ s, hp, base }: { s: ResumeSummarySection; hp: HeadingProps; base: number }) {
  if (!s.data.text) return null;
  return (
    <div style={{ marginBottom: 16 }}>
      <SectionHeading {...hp} text={s.data.heading} />
      <HtmlContent html={s.data.text} style={{ fontSize: base * 0.96, color: '#2d2d2d', lineHeight: 1.65 }} />
    </div>
  );
}

function ExperienceView({ s, hp, accent, base, entrySpacing }: { s: ResumeExperienceSection; hp: HeadingProps; accent: string; base: number; entrySpacing: number }) {
  if (!s.data.items.length) return null;
  return (
    <div style={{ marginBottom: 16 }}>
      <SectionHeading {...hp} text={s.data.heading} />
      {s.data.items.map(item => (
        <div key={item.id} style={{ marginBottom: entrySpacing, pageBreakInside: 'avoid' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 8 }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <span style={{ fontWeight: 700, fontSize: base, color: '#111' }}>{item.role}</span>
              {item.company && <span style={{ color: '#555', fontStyle: 'italic', fontSize: base * 0.96 }}>{' '}· {item.company}</span>}
            </div>
            <div style={{ fontSize: base * 0.84, color: '#666', textAlign: 'right', flexShrink: 0 }}>
              {item.startDate && <span>{item.startDate}{item.current ? ' – Present' : item.endDate ? ` – ${item.endDate}` : ''}</span>}
              {item.location && <div style={{ color: '#888', fontSize: base * 0.82 }}>{item.location}</div>}
            </div>
          </div>
          {item.description && (
            <HtmlContent html={item.description} style={{ fontSize: base * 0.95, color: '#333', marginTop: 4, lineHeight: 1.55 }} />
          )}
          {item.highlights?.length ? <TechTags tags={item.highlights} accent={accent} base={base} /> : null}
        </div>
      ))}
    </div>
  );
}

function EducationView({ s, hp, base, entrySpacing }: { s: ResumeEducationSection; hp: HeadingProps; base: number; entrySpacing: number }) {
  if (!s.data.items.length) return null;
  return (
    <div style={{ marginBottom: 16 }}>
      <SectionHeading {...hp} text={s.data.heading} />
      {s.data.items.map(item => (
        <div key={item.id} style={{ marginBottom: entrySpacing * 0.8 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 8 }}>
            <div style={{ flex: 1 }}>
              <span style={{ fontWeight: 700, fontSize: base, color: '#111' }}>{item.degree}{item.field ? `, ${item.field}` : ''}</span>
              {item.institution && <span style={{ color: '#555', fontStyle: 'italic', fontSize: base * 0.96 }}>{' '}· {item.institution}</span>}
            </div>
            <div style={{ fontSize: base * 0.84, color: '#666', flexShrink: 0 }}>
              {item.startDate && <span>{item.startDate}{item.endDate ? ` – ${item.endDate}` : ''}</span>}
              {item.gpa && <div style={{ color: '#888' }}>GPA: {item.gpa}</div>}
            </div>
          </div>
          {item.description && (
            <HtmlContent html={item.description} style={{ fontSize: base * 0.92, color: '#444', marginTop: 3, lineHeight: 1.5 }} />
          )}
        </div>
      ))}
    </div>
  );
}

function SkillsView({ s, hp, base }: { s: ResumeSkillsSection; hp: HeadingProps; base: number }) {
  if (!s.data.items.length) return null;
  const cats = new Map<string, string[]>();
  for (const sk of s.data.items) {
    const c = sk.category || 'Skills';
    if (!cats.has(c)) cats.set(c, []);
    cats.get(c)!.push(sk.name);
  }
  return (
    <div style={{ marginBottom: 16 }}>
      <SectionHeading {...hp} text={s.data.heading} />
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        {Array.from(cats.entries()).map(([cat, names]) => (
          <div key={cat} style={{ fontSize: base * 0.96, lineHeight: 1.5 }}>
            <span style={{ fontWeight: 700, color: '#111' }}>{cat}:</span>{' '}
            <span style={{ color: '#333' }}>{names.join(', ')}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function ProjectsView({ s, hp, accent, base, entrySpacing }: { s: ResumeProjectsSection; hp: HeadingProps; accent: string; base: number; entrySpacing: number }) {
  if (!s.data.items.length) return null;
  return (
    <div style={{ marginBottom: 16 }}>
      <SectionHeading {...hp} text={s.data.heading} />
      {s.data.items.map(item => (
        <div key={item.id} style={{ marginBottom: entrySpacing, pageBreakInside: 'avoid' }}>
          <div style={{ fontWeight: 700, fontSize: base, color: item.liveUrl ? accent : '#111' }}>
            {item.liveUrl
              ? <a href={item.liveUrl} style={{ color: accent, textDecoration: 'none' }}>{item.title}</a>
              : item.title}
          </div>
          {item.description && (
            <HtmlContent html={item.description} style={{ fontSize: base * 0.95, color: '#333', marginTop: 4, lineHeight: 1.55 }} />
          )}
          {item.tags?.length ? <TechTags tags={item.tags} accent={accent} base={base} /> : null}
        </div>
      ))}
    </div>
  );
}

function CertificationsView({ s, hp, accent, base }: { s: ResumeCertificationsSection; hp: HeadingProps; accent: string; base: number }) {
  if (!s.data.items.length) return null;
  return (
    <div style={{ marginBottom: 16 }}>
      <SectionHeading {...hp} text={s.data.heading} />
      {s.data.items.map(item => (
        <div key={item.id} style={{ marginBottom: 7 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 8 }}>
            <div>
              <span style={{ fontWeight: 700, color: item.url ? accent : '#111', fontSize: base * 0.98 }}>
                {item.url ? <a href={item.url} style={{ color: accent, textDecoration: 'none' }}>{item.name}</a> : item.name}
              </span>
              {item.issuer && <span style={{ color: '#555', fontStyle: 'italic', fontSize: base * 0.93 }}>{' '}· {item.issuer}</span>}
            </div>
            {item.date && <span style={{ fontSize: base * 0.84, color: '#666', flexShrink: 0 }}>{item.date}</span>}
          </div>
          {item.credentialId && <div style={{ fontSize: base * 0.82, color: '#888', marginTop: 1 }}>ID: {item.credentialId}</div>}
        </div>
      ))}
    </div>
  );
}

function SectionView({ section, accent, template, base, entrySpacing, hStyle, hSize, hCase, hAlign }: {
  section: ResumeSection;
  accent: string; template: TemplateId; base: number; entrySpacing: number;
  hStyle: HeadingStyle; hSize: HeadingSize; hCase: HeadingCase; hAlign: HeadingAlign;
}) {
  const hp: HeadingProps = { text: '', accent, base, hStyle, hSize, hCase, hAlign, template };
  switch (section.type) {
    case 'contact':        return null;
    case 'summary':        return <SummaryView s={section} hp={hp} base={base} />;
    case 'experience':     return <ExperienceView s={section} hp={hp} accent={accent} base={base} entrySpacing={entrySpacing} />;
    case 'education':      return <EducationView s={section} hp={hp} base={base} entrySpacing={entrySpacing} />;
    case 'skills':         return <SkillsView s={section} hp={hp} base={base} />;
    case 'projects':       return <ProjectsView s={section} hp={hp} accent={accent} base={base} entrySpacing={entrySpacing} />;
    case 'certifications': return <CertificationsView s={section} hp={hp} accent={accent} base={base} />;
    default:               return null;
  }
}

// ─── Main preview ─────────────────────────────────────────────────────────────

export function ResumePreview() {
  const { resume } = useResumeStore();

  const font    = resume?.theme.font ?? 'inter';
  const fontUrl = getGoogleFontUrl(font);

  // Load Google Font if needed
  useEffect(() => {
    if (!fontUrl) return;
    const id = `gf-${font}`;
    if (document.getElementById(id)) return;
    const link = document.createElement('link');
    link.id = id;
    link.rel = 'stylesheet';
    link.href = fontUrl;
    document.head.appendChild(link);
  }, [font, fontUrl]);

  if (!resume) return null;

  const {
    accent       = '#2563eb',
    template     = 'classic',
    font: fontId = 'inter',
    fontSize     = 11.5,
    lineHeight   = 1.55,
    marginH      = 52,
    marginV      = 48,
    entrySpacing = 11,
    headingStyle = 'underline',
    headingSize  = 's',
    headingCase  = 'uppercase',
    headingAlign = 'left',
    pageSize     = 'a4',
  } = resume.theme;

  const base  = fontSize;
  const pageW = pageSize === 'letter' ? 816 : 794;
  const pageH = pageSize === 'letter' ? 1056 : 1123;
  const tpl   = template as TemplateId;

  const { sectionsOrder } = resume.layout;
  const orderedSections = [
    ...sectionsOrder.map(id => resume.sections.find(s => s.id === id)).filter((s): s is ResumeSection => !!s && s.visible),
    ...resume.sections.filter(s => !sectionsOrder.includes(s.id) && s.visible),
  ];

  const contact = orderedSections.find(s => s.type === 'contact') as ResumeContactSection | undefined;
  const bodySections = orderedSections.filter(s => s.type !== 'contact');

  const hStyle   = headingStyle as HeadingStyle;
  const hSize    = headingSize as HeadingSize;
  const hCase    = headingCase as HeadingCase;
  const hAlign   = headingAlign as HeadingAlign;

  return (
    <div
      className="flex-1 overflow-auto"
      style={{ background: '#94a3b8', display: 'flex', justifyContent: 'center', padding: '28px 20px', minHeight: 0 }}
    >
      <div
        id="resume-page"
        style={{
          width: pageW,
          flexShrink: 0,
          background: 'white',
          minHeight: pageH,
          boxShadow: '0 8px 40px rgba(0,0,0,0.22), 0 2px 8px rgba(0,0,0,0.08)',
          padding: `${marginV}px ${marginH}px`,
          fontFamily: getFontCss(fontId),
          fontSize: base,
          color: '#1a1a1a',
          lineHeight,
          boxSizing: 'border-box',
        }}
      >
        {/* Contact header */}
        {contact && tpl === 'classic' && <ClassicContact s={contact} accent={accent} base={base} />}
        {contact && tpl === 'modern'  && <ModernContact  s={contact} accent={accent} base={base} />}
        {contact && tpl === 'minimal' && <MinimalContact s={contact} accent={accent} base={base} />}

        {/* Body sections */}
        {bodySections.map(section => (
          <SectionView
            key={section.id}
            section={section}
            accent={accent}
            template={tpl}
            base={base}
            entrySpacing={entrySpacing}
            hStyle={hStyle}
            hSize={hSize}
            hCase={hCase}
            hAlign={hAlign}
          />
        ))}
      </div>
    </div>
  );
}
