'use client';

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
} from '@devfolio/shared';

export function ResumePreview() {
  const { resume } = useResumeStore();
  if (!resume) return null;

  const orderedSections = resume.layout.sectionsOrder
    .map((id) => resume.sections.find((s) => s.id === id))
    .filter((s): s is ResumeSection => s !== undefined)
    .filter((s) => s.visible);

  const inOrder = new Set(resume.layout.sectionsOrder);
  const remaining = resume.sections.filter((s) => !inOrder.has(s.id) && s.visible);
  const allSections = [...orderedSections, ...remaining];

  const { accent, template, font } = resume.theme;
  const accentColor = accent ?? '#2563eb';

  const fontFamily =
    font === 'georgia' ? 'Georgia, serif' :
    font === 'roboto' ? 'Roboto, sans-serif' :
    'Inter, -apple-system, sans-serif';

  const headingStyle =
    template === 'modern'
      ? { borderLeft: `3px solid ${accentColor}`, paddingLeft: 8 }
      : template === 'minimal'
      ? { fontWeight: 500, letterSpacing: '0.05em', textTransform: 'uppercase' as const, fontSize: '0.72em', color: '#888' }
      : { borderBottom: `1.5px solid ${accentColor}`, paddingBottom: 2 };

  return (
    <div className="flex-1 bg-slate-950 overflow-auto flex justify-center py-8 px-4">
      <div
        className="bg-white shadow-2xl w-full max-w-[760px] min-h-[1056px] p-[40px]"
        style={{ fontFamily, fontSize: 12, color: '#1a1a1a', lineHeight: 1.5 }}
      >
        {allSections.map((s) => (
          <SectionView key={s.id} section={s} accentColor={accentColor} headingStyle={headingStyle} />
        ))}
      </div>
    </div>
  );
}

function SectionView({
  section,
  accentColor,
  headingStyle,
}: {
  section: ResumeSection;
  accentColor: string;
  headingStyle: React.CSSProperties;
}) {
  switch (section.type) {
    case 'contact':   return <ContactView s={section} accentColor={accentColor} />;
    case 'summary':   return <SummaryView s={section} headingStyle={headingStyle} />;
    case 'experience': return <ExperienceView s={section} headingStyle={headingStyle} />;
    case 'education':  return <EducationView s={section} headingStyle={headingStyle} />;
    case 'skills':     return <SkillsView s={section} headingStyle={headingStyle} />;
    case 'projects':   return <ProjectsView s={section} headingStyle={headingStyle} />;
    case 'certifications': return <CertificationsView s={section} headingStyle={headingStyle} />;
    default: return null;
  }
}

function ContactView({ s, accentColor }: { s: ResumeContactSection; accentColor: string }) {
  const { name, email, phone, location, website, linkedin, github } = s.data;
  const links: string[] = [];
  if (email) links.push(email);
  if (phone) links.push(phone);
  if (location) links.push(location);
  if (website) links.push(website.replace(/^https?:\/\//, ''));
  if (linkedin) links.push(linkedin.replace(/^https?:\/\//, ''));
  if (github) links.push(github.replace(/^https?:\/\//, ''));

  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{ fontSize: 22, fontWeight: 700, color: '#111', lineHeight: 1.2 }}>{name || 'Your Name'}</div>
      {links.length > 0 && (
        <div style={{ marginTop: 4, fontSize: 11, color: '#555' }}>
          {links.join(' · ')}
        </div>
      )}
    </div>
  );
}

function Heading({ text, style }: { text: string; style: React.CSSProperties }) {
  return (
    <div style={{ fontSize: 11.5, fontWeight: 700, marginBottom: 6, ...style }}>
      {text}
    </div>
  );
}

function SummaryView({ s, headingStyle }: { s: ResumeSummarySection; headingStyle: React.CSSProperties }) {
  if (!s.data.text) return null;
  return (
    <div style={{ marginBottom: 14 }}>
      <Heading text={s.data.heading} style={headingStyle} />
      <div style={{ fontSize: 11.5, color: '#333' }}>{s.data.text}</div>
    </div>
  );
}

function ExperienceView({ s, headingStyle }: { s: ResumeExperienceSection; headingStyle: React.CSSProperties }) {
  if (!s.data.items.length) return null;
  return (
    <div style={{ marginBottom: 14 }}>
      <Heading text={s.data.heading} style={headingStyle} />
      {s.data.items.map((item) => (
        <div key={item.id} style={{ marginBottom: 8 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
            <div>
              <span style={{ fontWeight: 600 }}>{item.role}</span>
              {item.company && <span style={{ color: '#555' }}> · {item.company}</span>}
            </div>
            <div style={{ fontSize: 10.5, color: '#666', textAlign: 'right' }}>
              {item.startDate && <span>{item.startDate}{item.current ? ' – Present' : item.endDate ? ` – ${item.endDate}` : ''}</span>}
              {item.location && <div>{item.location}</div>}
            </div>
          </div>
          {item.description && <div style={{ fontSize: 11, color: '#333', marginTop: 2 }}>{item.description}</div>}
          {item.highlights?.length ? (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginTop: 4 }}>
              {item.highlights.map((t) => (
                <span key={t} style={{ fontSize: 10, background: '#f1f5f9', color: '#475569', padding: '1px 6px', borderRadius: 3, border: '1px solid #e2e8f0' }}>{t}</span>
              ))}
            </div>
          ) : null}
        </div>
      ))}
    </div>
  );
}

function EducationView({ s, headingStyle }: { s: ResumeEducationSection; headingStyle: React.CSSProperties }) {
  if (!s.data.items.length) return null;
  return (
    <div style={{ marginBottom: 14 }}>
      <Heading text={s.data.heading} style={headingStyle} />
      {s.data.items.map((item) => (
        <div key={item.id} style={{ marginBottom: 8 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
            <div>
              <span style={{ fontWeight: 600 }}>{item.degree}{item.field ? `, ${item.field}` : ''}</span>
              {item.institution && <span style={{ color: '#555' }}> · {item.institution}</span>}
            </div>
            <div style={{ fontSize: 10.5, color: '#666' }}>
              {item.startDate && <span>{item.startDate}{item.endDate ? ` – ${item.endDate}` : ''}</span>}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function SkillsView({ s, headingStyle }: { s: ResumeSkillsSection; headingStyle: React.CSSProperties }) {
  if (!s.data.items.length) return null;
  const categories = new Map<string, string[]>();
  for (const skill of s.data.items) {
    const cat = skill.category ?? 'Skills';
    if (!categories.has(cat)) categories.set(cat, []);
    categories.get(cat)!.push(skill.name);
  }
  return (
    <div style={{ marginBottom: 14 }}>
      <Heading text={s.data.heading} style={headingStyle} />
      {Array.from(categories.entries()).map(([cat, names]) => (
        <div key={cat} style={{ fontSize: 11.5, marginBottom: 2 }}>
          <span style={{ fontWeight: 600 }}>{cat}: </span>
          <span style={{ color: '#333' }}>{names.join(', ')}</span>
        </div>
      ))}
    </div>
  );
}

function ProjectsView({ s, headingStyle }: { s: ResumeProjectsSection; headingStyle: React.CSSProperties }) {
  if (!s.data.items.length) return null;
  return (
    <div style={{ marginBottom: 14 }}>
      <Heading text={s.data.heading} style={headingStyle} />
      {s.data.items.map((item) => (
        <div key={item.id} style={{ marginBottom: 8 }}>
          <div style={{ fontWeight: 600 }}>{item.title}</div>
          {item.description && <div style={{ fontSize: 11, color: '#333', marginTop: 2 }}>{item.description}</div>}
          {item.tags?.length ? (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginTop: 4 }}>
              {item.tags.map((t) => (
                <span key={t} style={{ fontSize: 10, background: '#f1f5f9', color: '#475569', padding: '1px 6px', borderRadius: 3, border: '1px solid #e2e8f0' }}>{t}</span>
              ))}
            </div>
          ) : null}
        </div>
      ))}
    </div>
  );
}

function CertificationsView({ s, headingStyle }: { s: ResumeCertificationsSection; headingStyle: React.CSSProperties }) {
  if (!s.data.items.length) return null;
  return (
    <div style={{ marginBottom: 14 }}>
      <Heading text={s.data.heading} style={headingStyle} />
      {s.data.items.map((item) => (
        <div key={item.id} style={{ marginBottom: 6 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <div>
              <span style={{ fontWeight: 600 }}>{item.name}</span>
              {item.issuer && <span style={{ color: '#555' }}> · {item.issuer}</span>}
            </div>
            {item.date && <span style={{ fontSize: 10.5, color: '#666' }}>{item.date}</span>}
          </div>
        </div>
      ))}
    </div>
  );
}
