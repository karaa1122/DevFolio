'use client';

import React, { useRef, useState } from 'react';
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
import { RichTextArea } from '@/components/ui/RichTextArea';

// ─── Shared primitives ────────────────────────────────────────────────────────

const inputCls =
  'w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100 transition-all';

const labelCls = 'block text-xs font-semibold text-slate-500 mb-1 uppercase tracking-wide';

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="mb-3">
      <label className={labelCls}>{label}</label>
      {children}
    </div>
  );
}

function TI({
  value, onChange, placeholder, type = 'text',
}: {
  value: string; onChange: (v: string) => void; placeholder?: string; type?: string;
}) {
  return (
    <input
      type={type}
      className={inputCls}
      value={value ?? ''}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
    />
  );
}

function AddButton({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="w-full py-2 border-2 border-dashed border-slate-200 rounded-lg text-xs font-semibold text-slate-400 hover:text-violet-600 hover:border-violet-300 transition-all flex items-center justify-center gap-1.5 mt-2"
    >
      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
      </svg>
      {label}
    </button>
  );
}

function EntryCard({
  title, subtitle, onRemove, children,
}: {
  title: string; subtitle?: string; onRemove: () => void; children: React.ReactNode;
}) {
  const [open, setOpen] = useState(true);
  return (
    <div className="border border-slate-200 rounded-xl overflow-hidden bg-white mb-2 shadow-sm">
      <div
        className="flex items-center gap-2 px-3 py-2.5 cursor-pointer bg-slate-50 hover:bg-slate-100 transition-colors"
        onClick={() => setOpen(v => !v)}
      >
        <div className="flex-1 min-w-0">
          <div className="text-xs font-semibold text-slate-700 truncate">{title || 'New entry'}</div>
          {subtitle && <div className="text-[10px] text-slate-400 truncate">{subtitle}</div>}
        </div>
        <button
          onClick={e => { e.stopPropagation(); onRemove(); }}
          className="text-slate-300 hover:text-red-500 transition-colors p-0.5 rounded shrink-0"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        <svg
          className={`w-3.5 h-3.5 text-slate-400 transition-transform shrink-0 ${open ? 'rotate-180' : ''}`}
          fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </div>
      {open && <div className="p-3">{children}</div>}
    </div>
  );
}

// ─── Image resize utility ──────────────────────────────────────────────────────

async function resizeImage(file: File, maxPx = 300, quality = 0.75): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = ev => {
      const img = new Image();
      img.onload = () => {
        const scale = Math.min(maxPx / img.width, maxPx / img.height, 1);
        const canvas = document.createElement('canvas');
        canvas.width = Math.round(img.width * scale);
        canvas.height = Math.round(img.height * scale);
        canvas.getContext('2d')?.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL('image/jpeg', quality));
      };
      img.onerror = reject;
      img.src = ev.target?.result as string;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// ─── Contact form ─────────────────────────────────────────────────────────────

function PhotoUpload({
  photo, shape, position, onUpdate,
}: {
  photo?: string;
  shape?: string;
  position?: string;
  onUpdate: (d: Partial<ResumeContactSection['data']>) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const data = await resizeImage(file);
      onUpdate({ photo: data });
    } catch { /* ignore */ }
  };

  const shapeClass = shape === 'square' ? 'rounded-md' : shape === 'rounded' ? 'rounded-xl' : 'rounded-full';

  return (
    <div className="mb-4">
      <label className={labelCls}>Profile Photo</label>
      <div className="flex items-center gap-3">
        {photo ? (
          <div className="relative shrink-0">
            <img src={photo} alt="Profile" className={`w-16 h-16 object-cover ${shapeClass} border-2 border-slate-200`} />
            <button
              onClick={() => onUpdate({ photo: undefined })}
              className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center text-xs hover:bg-red-600 transition-colors"
            >×</button>
          </div>
        ) : (
          <div
            className={`w-16 h-16 ${shapeClass} bg-slate-100 border-2 border-dashed border-slate-300 flex items-center justify-center cursor-pointer hover:bg-slate-200 transition-colors shrink-0`}
            onClick={() => inputRef.current?.click()}
          >
            <svg className="w-6 h-6 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 16.5V9.75m0 0 3 3m-3-3-3 3M6.75 19.5a4.5 4.5 0 0 1-1.41-8.775 5.25 5.25 0 0 1 10.338-2.32A4.5 4.5 0 0 1 17.25 19.5H6.75Z" />
            </svg>
          </div>
        )}
        <div className="flex-1 space-y-2">
          <button
            onClick={() => inputRef.current?.click()}
            className="w-full py-1.5 text-xs font-medium border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 transition-colors"
          >
            {photo ? 'Change Photo' : 'Upload Photo'}
          </button>
          <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />

          {photo && (
            <div className="flex gap-1.5">
              {(['circle', 'square', 'rounded'] as const).map(s => (
                <button
                  key={s}
                  onClick={() => onUpdate({ photoShape: s })}
                  title={s}
                  className={`flex-1 h-6 text-[10px] font-medium rounded border transition-colors ${
                    (shape ?? 'circle') === s ? 'bg-violet-100 border-violet-400 text-violet-700' : 'border-slate-200 text-slate-500 hover:border-slate-300'
                  }`}
                >
                  {s === 'circle' ? '●' : s === 'square' ? '■' : '▪'}
                </button>
              ))}
              {(['left', 'right'] as const).map(p => (
                <button
                  key={p}
                  onClick={() => onUpdate({ photoPosition: p })}
                  title={`Photo on ${p}`}
                  className={`flex-1 h-6 text-[10px] font-medium rounded border transition-colors capitalize ${
                    (position ?? 'right') === p ? 'bg-violet-100 border-violet-400 text-violet-700' : 'border-slate-200 text-slate-500 hover:border-slate-300'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function ContactForm({ data, onUpdate }: {
  data: ResumeContactSection['data'];
  onUpdate: (d: Partial<ResumeContactSection['data']>) => void;
}) {
  const [showExtra, setShowExtra] = useState(!!(data.dob || data.nationality || data.maritalStatus || data.availability));

  return (
    <div className="p-4">
      <PhotoUpload
        photo={data.photo}
        shape={data.photoShape}
        position={data.photoPosition}
        onUpdate={onUpdate}
      />

      <Field label="Full Name">
        <TI value={data.name ?? ''} onChange={v => onUpdate({ name: v })} placeholder="Jane Smith" />
      </Field>
      <Field label="Job Title / Headline">
        <TI value={data.title ?? ''} onChange={v => onUpdate({ title: v })} placeholder="Senior Backend Engineer" />
      </Field>

      {/* Name alignment */}
      <div className="mb-3">
        <label className={labelCls}>Name Alignment</label>
        <div className="flex gap-1.5">
          {(['left', 'center'] as const).map(a => (
            <button
              key={a}
              onClick={() => onUpdate({ nameAlign: a })}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-lg border-2 capitalize transition-all ${
                (data.nameAlign ?? 'center') === a
                  ? 'bg-violet-600 text-white border-violet-600'
                  : 'bg-white text-slate-600 border-slate-200 hover:border-violet-300'
              }`}
            >
              {a}
            </button>
          ))}
        </div>
      </div>

      <div className="border-t border-slate-100 my-3" />

      <Field label="Email">
        <TI value={data.email ?? ''} onChange={v => onUpdate({ email: v })} placeholder="jane@example.com" type="email" />
      </Field>
      <Field label="Phone">
        <TI value={data.phone ?? ''} onChange={v => onUpdate({ phone: v })} placeholder="+964 750 123 4567" type="tel" />
      </Field>
      <Field label="Location">
        <TI value={data.location ?? ''} onChange={v => onUpdate({ location: v })} placeholder="Erbil, Iraq" />
      </Field>

      <div className="border-t border-slate-100 my-3" />

      <Field label="Website">
        <TI value={data.website ?? ''} onChange={v => onUpdate({ website: v })} placeholder="https://yoursite.com" />
      </Field>
      <Field label="LinkedIn">
        <TI value={data.linkedin ?? ''} onChange={v => onUpdate({ linkedin: v })} placeholder="https://linkedin.com/in/..." />
      </Field>
      <Field label="GitHub">
        <TI value={data.github ?? ''} onChange={v => onUpdate({ github: v })} placeholder="https://github.com/..." />
      </Field>

      {/* Extra personal details */}
      <div className="border-t border-slate-100 my-3" />
      <button
        onClick={() => setShowExtra(v => !v)}
        className="flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-violet-600 transition-colors mb-2 w-full"
      >
        <svg className={`w-3.5 h-3.5 transition-transform ${showExtra ? 'rotate-90' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
        </svg>
        Additional Details (DOB, Nationality, etc.)
      </button>

      {showExtra && (
        <div>
          <div className="grid grid-cols-2 gap-2">
            <Field label="Date of Birth">
              <TI value={data.dob ?? ''} onChange={v => onUpdate({ dob: v })} placeholder="Jan 1, 1995" />
            </Field>
            <Field label="Nationality">
              <TI value={data.nationality ?? ''} onChange={v => onUpdate({ nationality: v })} placeholder="Kurdish" />
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <Field label="Marital Status">
              <TI value={data.maritalStatus ?? ''} onChange={v => onUpdate({ maritalStatus: v })} placeholder="Single" />
            </Field>
            <Field label="Availability">
              <TI value={data.availability ?? ''} onChange={v => onUpdate({ availability: v })} placeholder="Immediately" />
            </Field>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Summary form ─────────────────────────────────────────────────────────────

function SummaryForm({ data, onUpdate }: {
  data: ResumeSummarySection['data'];
  onUpdate: (d: Partial<ResumeSummarySection['data']>) => void;
}) {
  return (
    <div className="p-4">
      <Field label="Section Heading">
        <TI value={data.heading ?? ''} onChange={v => onUpdate({ heading: v })} />
      </Field>
      <Field label="Summary">
        <RichTextArea
          value={data.text ?? ''}
          onChange={v => onUpdate({ text: v })}
          placeholder="A concise overview of your professional background, key skills, and career goals..."
          minHeight={100}
        />
      </Field>
    </div>
  );
}

// ─── Experience form ──────────────────────────────────────────────────────────

function ExperienceForm({ data, onUpdate }: {
  data: ResumeExperienceSection['data'];
  onUpdate: (d: Partial<ResumeExperienceSection['data']>) => void;
}) {
  const items = data.items ?? [];

  const updateItem = (idx: number, patch: Partial<typeof items[0]>) =>
    onUpdate({ items: items.map((it, i) => i === idx ? { ...it, ...patch } : it) });

  const addItem = () => onUpdate({
    items: [...items, { id: generateId(), role: '', company: '', startDate: '', endDate: '', current: false, description: '', location: '', highlights: [] }],
  });

  return (
    <div className="p-4">
      <Field label="Section Heading">
        <TI value={data.heading ?? ''} onChange={v => onUpdate({ heading: v })} />
      </Field>

      {items.map((item, idx) => (
        <EntryCard
          key={item.id}
          title={item.role || 'New role'}
          subtitle={item.company}
          onRemove={() => onUpdate({ items: items.filter((_, i) => i !== idx) })}
        >
          <div className="grid grid-cols-2 gap-2">
            <Field label="Job Title">
              <TI value={item.role ?? ''} onChange={v => updateItem(idx, { role: v })} placeholder="Software Engineer" />
            </Field>
            <Field label="Company">
              <TI value={item.company ?? ''} onChange={v => updateItem(idx, { company: v })} placeholder="Acme Corp" />
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <Field label="Start Date">
              <TI value={item.startDate ?? ''} onChange={v => updateItem(idx, { startDate: v })} placeholder="Jan 2022" />
            </Field>
            <Field label="End Date">
              <TI value={item.endDate ?? ''} onChange={v => updateItem(idx, { endDate: v })} placeholder={item.current ? 'Present' : 'Dec 2023'} />
            </Field>
          </div>
          <label className="flex items-center gap-2 text-xs text-slate-600 cursor-pointer mb-3">
            <input
              type="checkbox"
              checked={item.current ?? false}
              onChange={e => updateItem(idx, { current: e.target.checked })}
              className="accent-violet-500 rounded"
            />
            Currently working here
          </label>
          <Field label="Location">
            <TI value={item.location ?? ''} onChange={v => updateItem(idx, { location: v })} placeholder="Remote / Erbil, Iraq" />
          </Field>
          <Field label="Achievements & Responsibilities">
            <RichTextArea
              value={item.description ?? ''}
              onChange={v => updateItem(idx, { description: v })}
              placeholder="Describe your key achievements and responsibilities..."
              minHeight={90}
            />
          </Field>
          <Field label="Tech Stack (comma-separated)">
            <TI
              value={(item.highlights ?? []).join(', ')}
              onChange={v => updateItem(idx, { highlights: v.split(',').map(t => t.trim()).filter(Boolean) })}
              placeholder="TypeScript, NestJS, PostgreSQL"
            />
          </Field>
        </EntryCard>
      ))}

      <AddButton label="Add Experience" onClick={addItem} />
    </div>
  );
}

// ─── Education form ───────────────────────────────────────────────────────────

function EducationForm({ data, onUpdate }: {
  data: ResumeEducationSection['data'];
  onUpdate: (d: Partial<ResumeEducationSection['data']>) => void;
}) {
  const items = data.items ?? [];

  const updateItem = (idx: number, patch: Partial<typeof items[0]>) =>
    onUpdate({ items: items.map((it, i) => i === idx ? { ...it, ...patch } : it) });

  const addItem = () => onUpdate({
    items: [...items, { id: generateId(), institution: '', degree: '', field: '', startDate: '', endDate: '', current: false, gpa: '', description: '' }],
  });

  return (
    <div className="p-4">
      <Field label="Section Heading">
        <TI value={data.heading ?? ''} onChange={v => onUpdate({ heading: v })} />
      </Field>

      {items.map((item, idx) => (
        <EntryCard
          key={item.id}
          title={item.degree || 'New degree'}
          subtitle={item.institution}
          onRemove={() => onUpdate({ items: items.filter((_, i) => i !== idx) })}
        >
          <Field label="Institution">
            <TI value={item.institution ?? ''} onChange={v => updateItem(idx, { institution: v })} placeholder="University of Kurdistan" />
          </Field>
          <div className="grid grid-cols-2 gap-2">
            <Field label="Degree">
              <TI value={item.degree ?? ''} onChange={v => updateItem(idx, { degree: v })} placeholder="B.Sc." />
            </Field>
            <Field label="Field of Study">
              <TI value={item.field as string ?? ''} onChange={v => updateItem(idx, { field: v })} placeholder="Computer Science" />
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <Field label="Start"><TI value={item.startDate ?? ''} onChange={v => updateItem(idx, { startDate: v })} placeholder="Sep 2018" /></Field>
            <Field label="End"><TI value={item.endDate ?? ''} onChange={v => updateItem(idx, { endDate: v })} placeholder="Jun 2022" /></Field>
          </div>
          <Field label="GPA">
            <TI value={item.gpa as string ?? ''} onChange={v => updateItem(idx, { gpa: v })} placeholder="3.8 / 4.0" />
          </Field>
          <Field label="Description">
            <RichTextArea
              value={item.description ?? ''}
              onChange={v => updateItem(idx, { description: v })}
              placeholder="Relevant courses, thesis, achievements..."
              minHeight={60}
            />
          </Field>
        </EntryCard>
      ))}

      <AddButton label="Add Education" onClick={addItem} />
    </div>
  );
}

// ─── Skills form ──────────────────────────────────────────────────────────────

function SkillsForm({ data, onUpdate }: {
  data: ResumeSkillsSection['data'];
  onUpdate: (d: Partial<ResumeSkillsSection['data']>) => void;
}) {
  const items = data.items ?? [];

  const updateItem = (idx: number, patch: Partial<typeof items[0]>) =>
    onUpdate({ items: items.map((it, i) => i === idx ? { ...it, ...patch } : it) });

  const addItem = () => onUpdate({
    items: [...items, { id: generateId(), name: '', category: '', level: undefined }],
  });

  return (
    <div className="p-4">
      <Field label="Section Heading">
        <TI value={data.heading ?? ''} onChange={v => onUpdate({ heading: v })} />
      </Field>
      <p className="text-xs text-slate-400 mb-3">Group skills by category — each category renders as a labelled row in the resume.</p>

      <div className="space-y-1.5">
        {items.map((item, idx) => (
          <div key={item.id} className="flex gap-2 items-center">
            <input
              className={`${inputCls} flex-[2]`}
              value={item.name ?? ''}
              onChange={e => updateItem(idx, { name: e.target.value })}
              placeholder="TypeScript"
            />
            <input
              className={`${inputCls} flex-1`}
              value={item.category ?? ''}
              onChange={e => updateItem(idx, { category: e.target.value })}
              placeholder="Category"
            />
            <button
              onClick={() => onUpdate({ items: items.filter((_, i) => i !== idx) })}
              className="text-slate-300 hover:text-red-500 transition-colors shrink-0 p-1"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        ))}
      </div>

      <AddButton label="Add Skill" onClick={addItem} />
    </div>
  );
}

// ─── Projects form ────────────────────────────────────────────────────────────

function ProjectsForm({ data, onUpdate }: {
  data: ResumeProjectsSection['data'];
  onUpdate: (d: Partial<ResumeProjectsSection['data']>) => void;
}) {
  const items = data.items ?? [];

  const updateItem = (idx: number, patch: Partial<typeof items[0]>) =>
    onUpdate({ items: items.map((it, i) => i === idx ? { ...it, ...patch } : it) });

  const addItem = () => onUpdate({
    items: [...items, { id: generateId(), title: '', description: '', liveUrl: '', tags: [], featured: false, status: 'completed' as const }],
  });

  return (
    <div className="p-4">
      <Field label="Section Heading">
        <TI value={data.heading ?? ''} onChange={v => onUpdate({ heading: v })} />
      </Field>

      {items.map((item, idx) => (
        <EntryCard
          key={item.id}
          title={item.title || 'New project'}
          onRemove={() => onUpdate({ items: items.filter((_, i) => i !== idx) })}
        >
          <Field label="Project Name">
            <TI value={item.title ?? ''} onChange={v => updateItem(idx, { title: v })} placeholder="Payment Gateway API" />
          </Field>
          <Field label="Live / GitHub URL">
            <TI value={(item.liveUrl as string | undefined) ?? ''} onChange={v => updateItem(idx, { liveUrl: v })} placeholder="https://github.com/..." />
          </Field>
          <Field label="Description">
            <RichTextArea
              value={item.description ?? ''}
              onChange={v => updateItem(idx, { description: v })}
              placeholder="Key features, tech decisions, impact..."
              minHeight={75}
            />
          </Field>
          <Field label="Tech Stack (comma-separated)">
            <TI
              value={(item.tags ?? []).join(', ')}
              onChange={v => updateItem(idx, { tags: v.split(',').map(t => t.trim()).filter(Boolean) })}
              placeholder="Node.js, Redis, Kafka"
            />
          </Field>
        </EntryCard>
      ))}

      <AddButton label="Add Project" onClick={addItem} />
    </div>
  );
}

// ─── Certifications form ──────────────────────────────────────────────────────

function CertificationsForm({ data, onUpdate }: {
  data: ResumeCertificationsSection['data'];
  onUpdate: (d: Partial<ResumeCertificationsSection['data']>) => void;
}) {
  const items = data.items ?? [];

  const updateItem = (idx: number, patch: Partial<ResumeCertification>) =>
    onUpdate({ items: items.map((it, i) => i === idx ? { ...it, ...patch } : it) });

  const addItem = () => onUpdate({
    items: [...items, { id: generateId(), name: '', issuer: '', date: '', url: '', credentialId: '' }],
  });

  return (
    <div className="p-4">
      <Field label="Section Heading">
        <TI value={data.heading ?? ''} onChange={v => onUpdate({ heading: v })} />
      </Field>

      {items.map((item, idx) => (
        <EntryCard
          key={item.id}
          title={item.name || 'New certification'}
          subtitle={item.issuer}
          onRemove={() => onUpdate({ items: items.filter((_, i) => i !== idx) })}
        >
          <Field label="Certification Name">
            <TI value={item.name ?? ''} onChange={v => updateItem(idx, { name: v })} placeholder="AWS Solutions Architect" />
          </Field>
          <Field label="Issuing Organization">
            <TI value={item.issuer ?? ''} onChange={v => updateItem(idx, { issuer: v })} placeholder="Amazon Web Services" />
          </Field>
          <div className="grid grid-cols-2 gap-2">
            <Field label="Date"><TI value={item.date ?? ''} onChange={v => updateItem(idx, { date: v })} placeholder="Mar 2024" /></Field>
            <Field label="Verify URL"><TI value={item.url ?? ''} onChange={v => updateItem(idx, { url: v })} placeholder="https://..." /></Field>
          </div>
          <Field label="Credential ID">
            <TI value={item.credentialId ?? ''} onChange={v => updateItem(idx, { credentialId: v })} placeholder="ABC-123456" />
          </Field>
        </EntryCard>
      ))}

      <AddButton label="Add Certification" onClick={addItem} />
    </div>
  );
}

// ─── Section dispatcher ───────────────────────────────────────────────────────

export function ResumeSectionEditor({ sectionId }: { sectionId: string }) {
  const { resume, updateSectionData } = useResumeStore();
  if (!resume) return null;

  const section = resume.sections.find(s => s.id === sectionId);
  if (!section) return null;

  type Updater = (d: Partial<ResumeSection['data']>) => void;
  const update: Updater = d => updateSectionData(sectionId, d);

  switch (section.type) {
    case 'contact':
      return <ContactForm data={section.data} onUpdate={update as Parameters<typeof ContactForm>[0]['onUpdate']} />;
    case 'summary':
      return <SummaryForm data={section.data} onUpdate={update as Parameters<typeof SummaryForm>[0]['onUpdate']} />;
    case 'experience':
      return <ExperienceForm data={section.data} onUpdate={update as Parameters<typeof ExperienceForm>[0]['onUpdate']} />;
    case 'education':
      return <EducationForm data={section.data} onUpdate={update as Parameters<typeof EducationForm>[0]['onUpdate']} />;
    case 'skills':
      return <SkillsForm data={section.data} onUpdate={update as Parameters<typeof SkillsForm>[0]['onUpdate']} />;
    case 'projects':
      return <ProjectsForm data={section.data} onUpdate={update as Parameters<typeof ProjectsForm>[0]['onUpdate']} />;
    case 'certifications':
      return <CertificationsForm data={section.data} onUpdate={update as Parameters<typeof CertificationsForm>[0]['onUpdate']} />;
    default:
      return null;
  }
}
