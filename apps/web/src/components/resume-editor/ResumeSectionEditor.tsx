'use client';

import { useState } from 'react';
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
  ResumeCertification,
} from '@devfolio/shared';
import { generateId } from '@/lib/utils';

const inputCls =
  'w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-violet-500';
const labelCls = 'block text-xs text-slate-400 mb-1';
const fieldCls = 'mb-3';

interface Props {
  sectionId: string;
}

export function ResumeSectionEditor({ sectionId }: Props) {
  const { resume, updateSectionData, selectSection } = useResumeStore();
  if (!resume) return null;

  const section = resume.sections.find((s) => s.id === sectionId);
  if (!section) return null;

  return (
    <div className="p-4">
      <div className="flex items-center gap-2 mb-4">
        <button onClick={() => selectSection(null)} className="text-slate-500 hover:text-slate-300 text-lg">
          ←
        </button>
        <h3 className="text-sm font-semibold text-slate-300 capitalize">{section.type}</h3>
      </div>
      <SectionForm section={section} onUpdate={(d) => updateSectionData(sectionId, d)} />
    </div>
  );
}

type Update<T> = (d: Partial<T>) => void;

function SectionForm({ section, onUpdate }: { section: ResumeSection; onUpdate: (d: Partial<ResumeSection['data']>) => void }) {
  switch (section.type) {
    case 'contact':
      return <ContactForm data={section.data} onUpdate={onUpdate as Update<ResumeContactSection['data']>} />;
    case 'summary':
      return <SummaryForm data={section.data} onUpdate={onUpdate as Update<ResumeSummarySection['data']>} />;
    case 'experience':
      return <ExperienceForm data={section.data} onUpdate={onUpdate as Update<ResumeExperienceSection['data']>} />;
    case 'education':
      return <EducationForm data={section.data} onUpdate={onUpdate as Update<ResumeEducationSection['data']>} />;
    case 'skills':
      return <SkillsForm data={section.data} onUpdate={onUpdate as Update<ResumeSkillsSection['data']>} />;
    case 'projects':
      return <ProjectsForm data={section.data} onUpdate={onUpdate as Update<ResumeProjectsSection['data']>} />;
    case 'certifications':
      return <CertificationsForm data={section.data} onUpdate={onUpdate as Update<ResumeCertificationsSection['data']>} />;
    default:
      return null;
  }
}

function F({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className={fieldCls}>
      <label className={labelCls}>{label}</label>
      {children}
    </div>
  );
}

function TextInput({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder?: string }) {
  return <input className={inputCls} value={value ?? ''} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} />;
}

function TagsInput({ value, onChange, placeholder }: { value: string[]; onChange: (v: string[]) => void; placeholder?: string }) {
  const [raw, setRaw] = useState((value ?? []).join(', '));
  const parse = (s: string) => s.split(',').map((t) => t.trim()).filter(Boolean);
  return (
    <input
      className={inputCls}
      value={raw}
      onChange={(e) => { setRaw(e.target.value); onChange(parse(e.target.value)); }}
      onBlur={() => { const tags = parse(raw); setRaw(tags.join(', ')); onChange(tags); }}
      placeholder={placeholder ?? 'comma separated'}
    />
  );
}

// ─── Contact ──────────────────────────────────────────────────────────────────

function ContactForm({ data, onUpdate }: { data: ResumeContactSection['data']; onUpdate: Update<ResumeContactSection['data']> }) {
  return (
    <div>
      <F label="Full Name"><TextInput value={data.name ?? ''} onChange={(v) => onUpdate({ name: v })} placeholder="Jane Smith" /></F>
      <F label="Email"><TextInput value={data.email ?? ''} onChange={(v) => onUpdate({ email: v })} placeholder="jane@example.com" /></F>
      <F label="Phone"><TextInput value={data.phone ?? ''} onChange={(v) => onUpdate({ phone: v })} placeholder="+1 555 000 0000" /></F>
      <F label="Location"><TextInput value={data.location ?? ''} onChange={(v) => onUpdate({ location: v })} placeholder="New York, NY" /></F>
      <F label="Website"><TextInput value={data.website ?? ''} onChange={(v) => onUpdate({ website: v })} placeholder="https://yoursite.com" /></F>
      <F label="LinkedIn"><TextInput value={data.linkedin ?? ''} onChange={(v) => onUpdate({ linkedin: v })} placeholder="https://linkedin.com/in/..." /></F>
      <F label="GitHub"><TextInput value={data.github ?? ''} onChange={(v) => onUpdate({ github: v })} placeholder="https://github.com/..." /></F>
    </div>
  );
}

// ─── Summary ──────────────────────────────────────────────────────────────────

function SummaryForm({ data, onUpdate }: { data: ResumeSummarySection['data']; onUpdate: Update<ResumeSummarySection['data']> }) {
  return (
    <div>
      <F label="Heading"><TextInput value={data.heading ?? ''} onChange={(v) => onUpdate({ heading: v })} /></F>
      <F label="Summary">
        <textarea
          className={`${inputCls} resize-none min-h-[100px]`}
          value={data.text ?? ''}
          onChange={(e) => onUpdate({ text: e.target.value })}
          placeholder="A brief summary of your professional background..."
        />
      </F>
    </div>
  );
}

// ─── Experience ───────────────────────────────────────────────────────────────

function ExperienceForm({ data, onUpdate }: { data: ResumeExperienceSection['data']; onUpdate: Update<ResumeExperienceSection['data']> }) {
  const items = data.items ?? [];

  const updateItem = (idx: number, patch: Partial<typeof items[0]>) => {
    const next = items.map((it, i) => (i === idx ? { ...it, ...patch } : it));
    onUpdate({ items: next });
  };

  const addItem = () =>
    onUpdate({ items: [...items, { id: generateId(), role: '', company: '', startDate: '', endDate: '', current: false, description: '', location: '', highlights: [] }] });

  const removeItem = (idx: number) => onUpdate({ items: items.filter((_, i) => i !== idx) });

  return (
    <div className="space-y-4">
      <F label="Section Heading"><TextInput value={data.heading ?? ''} onChange={(v) => onUpdate({ heading: v })} /></F>
      {items.map((item, idx) => (
        <div key={item.id} className="bg-slate-800/60 rounded-lg p-3 space-y-2">
          <div className="flex justify-between items-center mb-1">
            <span className="text-xs font-medium text-slate-400">Entry {idx + 1}</span>
            <button onClick={() => removeItem(idx)} className="text-xs text-red-500 hover:text-red-400">Remove</button>
          </div>
          <TextInput value={item.role ?? ''} onChange={(v) => updateItem(idx, { role: v })} placeholder="Job Title / Role" />
          <TextInput value={item.company ?? ''} onChange={(v) => updateItem(idx, { company: v })} placeholder="Company" />
          <div className="grid grid-cols-2 gap-2">
            <TextInput value={item.startDate ?? ''} onChange={(v) => updateItem(idx, { startDate: v })} placeholder="Start (e.g. Jan 2022)" />
            <TextInput value={item.endDate ?? ''} onChange={(v) => updateItem(idx, { endDate: v })} placeholder="End (or leave blank)" />
          </div>
          <label className="flex items-center gap-2 text-xs text-slate-400 cursor-pointer">
            <input type="checkbox" checked={item.current ?? false} onChange={(e) => updateItem(idx, { current: e.target.checked })} className="accent-violet-500" />
            Currently here
          </label>
          <TextInput value={item.location ?? ''} onChange={(v) => updateItem(idx, { location: v })} placeholder="Location (optional)" />
          <textarea
            className={`${inputCls} resize-none min-h-[60px]`}
            value={item.description ?? ''}
            onChange={(e) => updateItem(idx, { description: e.target.value })}
            placeholder="Description / achievements..."
          />
        </div>
      ))}
      <button onClick={addItem} className="w-full py-2 border border-dashed border-slate-700 rounded-lg text-xs text-slate-500 hover:text-slate-300 hover:border-slate-600 transition-colors">
        + Add Entry
      </button>
    </div>
  );
}

// ─── Education ────────────────────────────────────────────────────────────────

function EducationForm({ data, onUpdate }: { data: ResumeEducationSection['data']; onUpdate: Update<ResumeEducationSection['data']> }) {
  const items = data.items ?? [];

  const updateItem = (idx: number, patch: Partial<typeof items[0]>) => {
    const next = items.map((it, i) => (i === idx ? { ...it, ...patch } : it));
    onUpdate({ items: next });
  };

  const addItem = () =>
    onUpdate({ items: [...items, { id: generateId(), institution: '', degree: '', field: '', startDate: '', endDate: '', current: false, gpa: '', description: '' }] });

  const removeItem = (idx: number) => onUpdate({ items: items.filter((_, i) => i !== idx) });

  return (
    <div className="space-y-4">
      <F label="Section Heading"><TextInput value={data.heading ?? ''} onChange={(v) => onUpdate({ heading: v })} /></F>
      {items.map((item, idx) => (
        <div key={item.id} className="bg-slate-800/60 rounded-lg p-3 space-y-2">
          <div className="flex justify-between items-center mb-1">
            <span className="text-xs font-medium text-slate-400">Entry {idx + 1}</span>
            <button onClick={() => removeItem(idx)} className="text-xs text-red-500 hover:text-red-400">Remove</button>
          </div>
          <TextInput value={item.institution ?? ''} onChange={(v) => updateItem(idx, { institution: v })} placeholder="University / School" />
          <TextInput value={item.degree ?? ''} onChange={(v) => updateItem(idx, { degree: v })} placeholder="Degree (e.g. Bachelor of Science)" />
          <TextInput value={(item.field as string | undefined) ?? ''} onChange={(v) => updateItem(idx, { field: v })} placeholder="Field of Study" />
          <div className="grid grid-cols-2 gap-2">
            <TextInput value={item.startDate ?? ''} onChange={(v) => updateItem(idx, { startDate: v })} placeholder="Start" />
            <TextInput value={(item.endDate as string | undefined) ?? ''} onChange={(v) => updateItem(idx, { endDate: v })} placeholder="End" />
          </div>
          <TextInput value={(item.gpa as string | undefined) ?? ''} onChange={(v) => updateItem(idx, { gpa: v })} placeholder="GPA (optional)" />
        </div>
      ))}
      <button onClick={addItem} className="w-full py-2 border border-dashed border-slate-700 rounded-lg text-xs text-slate-500 hover:text-slate-300 hover:border-slate-600 transition-colors">
        + Add Entry
      </button>
    </div>
  );
}

// ─── Skills ───────────────────────────────────────────────────────────────────

function SkillsForm({ data, onUpdate }: { data: ResumeSkillsSection['data']; onUpdate: Update<ResumeSkillsSection['data']> }) {
  const items = data.items ?? [];

  const updateItem = (idx: number, patch: Partial<typeof items[0]>) => {
    const next = items.map((it, i) => (i === idx ? { ...it, ...patch } : it));
    onUpdate({ items: next });
  };

  const addItem = () =>
    onUpdate({ items: [...items, { id: generateId(), name: '', category: '', level: undefined }] });

  const removeItem = (idx: number) => onUpdate({ items: items.filter((_, i) => i !== idx) });

  return (
    <div className="space-y-4">
      <F label="Section Heading"><TextInput value={data.heading ?? ''} onChange={(v) => onUpdate({ heading: v })} /></F>
      {items.map((item, idx) => (
        <div key={item.id} className="bg-slate-800/60 rounded-lg p-3 space-y-2">
          <div className="flex justify-between items-center mb-1">
            <span className="text-xs font-medium text-slate-400">Skill {idx + 1}</span>
            <button onClick={() => removeItem(idx)} className="text-xs text-red-500 hover:text-red-400">Remove</button>
          </div>
          <TextInput value={item.name ?? ''} onChange={(v) => updateItem(idx, { name: v })} placeholder="Skill name (e.g. TypeScript)" />
          <TextInput value={item.category ?? ''} onChange={(v) => updateItem(idx, { category: v })} placeholder="Category (e.g. Languages)" />
        </div>
      ))}
      <button onClick={addItem} className="w-full py-2 border border-dashed border-slate-700 rounded-lg text-xs text-slate-500 hover:text-slate-300 hover:border-slate-600 transition-colors">
        + Add Skill
      </button>
    </div>
  );
}

// ─── Projects ─────────────────────────────────────────────────────────────────

function ProjectsForm({ data, onUpdate }: { data: ResumeProjectsSection['data']; onUpdate: Update<ResumeProjectsSection['data']> }) {
  const items = data.items ?? [];

  const updateItem = (idx: number, patch: Partial<typeof items[0]>) => {
    const next = items.map((it, i) => (i === idx ? { ...it, ...patch } : it));
    onUpdate({ items: next });
  };

  const addItem = () =>
    onUpdate({ items: [...items, { id: generateId(), title: '', description: '', liveUrl: '', tags: [], featured: false, status: 'completed' as const }] });

  const removeItem = (idx: number) => onUpdate({ items: items.filter((_, i) => i !== idx) });

  return (
    <div className="space-y-4">
      <F label="Section Heading"><TextInput value={data.heading ?? ''} onChange={(v) => onUpdate({ heading: v })} /></F>
      {items.map((item, idx) => (
        <div key={item.id} className="bg-slate-800/60 rounded-lg p-3 space-y-2">
          <div className="flex justify-between items-center mb-1">
            <span className="text-xs font-medium text-slate-400">Project {idx + 1}</span>
            <button onClick={() => removeItem(idx)} className="text-xs text-red-500 hover:text-red-400">Remove</button>
          </div>
          <TextInput value={item.title ?? ''} onChange={(v) => updateItem(idx, { title: v })} placeholder="Project Title" />
          <TextInput value={(item.liveUrl as string | undefined) ?? ''} onChange={(v) => updateItem(idx, { liveUrl: v })} placeholder="Live URL (optional)" />
          <textarea
            className={`${inputCls} resize-none min-h-[60px]`}
            value={item.description ?? ''}
            onChange={(e) => updateItem(idx, { description: e.target.value })}
            placeholder="Description..."
          />
          <TagsInput value={item.tags ?? []} onChange={(v) => updateItem(idx, { tags: v })} placeholder="react, nextjs, postgres" />
        </div>
      ))}
      <button onClick={addItem} className="w-full py-2 border border-dashed border-slate-700 rounded-lg text-xs text-slate-500 hover:text-slate-300 hover:border-slate-600 transition-colors">
        + Add Project
      </button>
    </div>
  );
}

// ─── Certifications ───────────────────────────────────────────────────────────

function CertificationsForm({ data, onUpdate }: { data: ResumeCertificationsSection['data']; onUpdate: Update<ResumeCertificationsSection['data']> }) {
  const items = data.items ?? [];

  const updateItem = (idx: number, patch: Partial<ResumeCertification>) => {
    const next = items.map((it, i) => (i === idx ? { ...it, ...patch } : it));
    onUpdate({ items: next });
  };

  const addItem = () =>
    onUpdate({ items: [...items, { id: generateId(), name: '', issuer: '', date: '', url: '', credentialId: '' }] });

  const removeItem = (idx: number) => onUpdate({ items: items.filter((_, i) => i !== idx) });

  return (
    <div className="space-y-4">
      <F label="Section Heading"><TextInput value={data.heading ?? ''} onChange={(v) => onUpdate({ heading: v })} /></F>
      {items.map((item, idx) => (
        <div key={item.id} className="bg-slate-800/60 rounded-lg p-3 space-y-2">
          <div className="flex justify-between items-center mb-1">
            <span className="text-xs font-medium text-slate-400">Cert {idx + 1}</span>
            <button onClick={() => removeItem(idx)} className="text-xs text-red-500 hover:text-red-400">Remove</button>
          </div>
          <TextInput value={item.name ?? ''} onChange={(v) => updateItem(idx, { name: v })} placeholder="Certification Name" />
          <TextInput value={item.issuer ?? ''} onChange={(v) => updateItem(idx, { issuer: v })} placeholder="Issuer (e.g. AWS)" />
          <TextInput value={item.date ?? ''} onChange={(v) => updateItem(idx, { date: v })} placeholder="Date (e.g. Mar 2024)" />
          <TextInput value={item.url ?? ''} onChange={(v) => updateItem(idx, { url: v })} placeholder="Verify URL (optional)" />
          <TextInput value={item.credentialId ?? ''} onChange={(v) => updateItem(idx, { credentialId: v })} placeholder="Credential ID (optional)" />
        </div>
      ))}
      <button onClick={addItem} className="w-full py-2 border border-dashed border-slate-700 rounded-lg text-xs text-slate-500 hover:text-slate-300 hover:border-slate-600 transition-colors">
        + Add Certification
      </button>
    </div>
  );
}
