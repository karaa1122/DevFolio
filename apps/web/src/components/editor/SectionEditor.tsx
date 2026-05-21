'use client';

import { useState } from 'react';
import { useEditorStore } from '@/store/editor.store';
import type {
  Section,
  HeroSection,
  AboutSection,
  ContactSection,
  ExperienceSection,
  EducationSection,
  ProjectsSection,
  SkillsSection,
  ExperienceItem,
  EducationItem,
  Project,
  Skill,
} from '@devfolio/shared';
import { generateId } from '@/lib/utils';

interface Props {
  sectionId: string;
}

export function SectionEditor({ sectionId }: Props) {
  const { portfolio, updateSectionData, selectSection } = useEditorStore();
  if (!portfolio) return null;

  const section = portfolio.sections.find((s) => s.id === sectionId);
  if (!section) return null;

  return (
    <div className="p-4">
      <div className="flex items-center gap-2 mb-4">
        <button
          onClick={() => selectSection(null)}
          className="text-slate-500 hover:text-slate-300 text-lg"
        >
          ←
        </button>
        <h3 className="text-sm font-semibold text-slate-300 capitalize">{section.type} Section</h3>
      </div>
      <SectionForm section={section} onUpdate={(data) => updateSectionData(sectionId, data)} />
    </div>
  );
}

interface FormProps {
  section: Section;
  onUpdate: (data: Partial<Section['data']>) => void;
}

type Update<T> = (d: Partial<T>) => void;

function SectionForm({ section, onUpdate }: FormProps) {
  switch (section.type) {
    case 'hero':
      return <HeroForm data={section.data} onUpdate={onUpdate as Update<HeroSection['data']>} />;
    case 'about':
      return <AboutForm data={section.data} onUpdate={onUpdate as Update<AboutSection['data']>} />;
    case 'contact':
      return (
        <ContactForm data={section.data} onUpdate={onUpdate as Update<ContactSection['data']>} />
      );
    case 'experience':
      return (
        <ExperienceForm
          data={section.data}
          onUpdate={onUpdate as Update<ExperienceSection['data']>}
        />
      );
    case 'education':
      return (
        <EducationForm
          data={section.data}
          onUpdate={onUpdate as Update<EducationSection['data']>}
        />
      );
    case 'projects':
      return (
        <ProjectsForm data={section.data} onUpdate={onUpdate as Update<ProjectsSection['data']>} />
      );
    case 'skills':
      return (
        <SkillsForm data={section.data} onUpdate={onUpdate as Update<SkillsSection['data']>} />
      );
    default:
      return null;
  }
}

// ─── Shared inputs ─────────────────────────────────────────────────────────

function FieldWrapper({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs text-slate-500 mb-1.5">{label}</label>
      {children}
    </div>
  );
}

const inputCls =
  'w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-violet-500';

function TextInput({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className={inputCls}
    />
  );
}

function TextareaInput({
  value,
  onChange,
  placeholder,
  rows = 3,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  rows?: number;
}) {
  return (
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      rows={rows}
      className={`${inputCls} resize-none`}
    />
  );
}

function TagsInput({
  value,
  onChange,
  placeholder,
}: {
  value: string[];
  onChange: (tags: string[]) => void;
  placeholder?: string;
}) {
  const [raw, setRaw] = useState(value.join(', '));

  const parse = (str: string) =>
    str.split(',').map((t) => t.trim()).filter(Boolean);

  return (
    <input
      type="text"
      value={raw}
      onChange={(e) => {
        setRaw(e.target.value);
        onChange(parse(e.target.value));
      }}
      onBlur={() => {
        const tags = parse(raw);
        setRaw(tags.join(', '));
        onChange(tags);
      }}
      placeholder={placeholder}
      className={inputCls}
    />
  );
}

function SelectInput({
  value,
  onChange,
  children,
}: {
  value: string;
  onChange: (v: string) => void;
  children: React.ReactNode;
}) {
  return (
    <select value={value} onChange={(e) => onChange(e.target.value)} className={inputCls}>
      {children}
    </select>
  );
}

function AddButton({ onClick, label = 'Add Item' }: { onClick: () => void; label?: string }) {
  return (
    <button
      onClick={onClick}
      className="w-full py-2 border border-dashed border-slate-700 hover:border-violet-600 text-slate-500 hover:text-violet-400 text-xs rounded-lg transition-colors"
    >
      + {label}
    </button>
  );
}

function ItemHeader({
  title,
  subtitle,
  expanded,
  onToggle,
  onDelete,
}: {
  title: string;
  subtitle?: string;
  expanded: boolean;
  onToggle: () => void;
  onDelete: () => void;
}) {
  return (
    <div
      className="flex items-center justify-between p-3 bg-slate-800 rounded-lg cursor-pointer hover:bg-slate-750"
      onClick={onToggle}
    >
      <div className="min-w-0">
        <p className="text-sm text-slate-200 truncate">{title || '(untitled)'}</p>
        {subtitle && <p className="text-xs text-slate-500 truncate">{subtitle}</p>}
      </div>
      <div className="flex items-center gap-1 ml-2 shrink-0">
        <span className="text-slate-500 text-xs">{expanded ? '▲' : '▼'}</span>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          className="text-slate-600 hover:text-red-400 transition-colors text-sm px-1"
          title="Remove"
        >
          ✕
        </button>
      </div>
    </div>
  );
}

// ─── Hero ──────────────────────────────────────────────────────────────────

function HeroForm({
  data,
  onUpdate,
}: {
  data: HeroSection['data'];
  onUpdate: Update<HeroSection['data']>;
}) {
  return (
    <div className="space-y-4">
      <FieldWrapper label="Full Name">
        <TextInput
          value={data.name}
          onChange={(v) => onUpdate({ name: v })}
          placeholder="Your Name"
        />
      </FieldWrapper>
      <FieldWrapper label="Title / Role">
        <TextInput
          value={data.title}
          onChange={(v) => onUpdate({ title: v })}
          placeholder="Backend Engineer"
        />
      </FieldWrapper>
      <FieldWrapper label="Subtitle">
        <TextInput
          value={data.subtitle ?? ''}
          onChange={(v) => onUpdate({ subtitle: v })}
          placeholder="NestJS · Django · Microservices"
        />
      </FieldWrapper>
      <FieldWrapper label="Bio">
        <TextareaInput
          value={data.bio ?? ''}
          onChange={(v) => onUpdate({ bio: v })}
          placeholder="A short bio about yourself..."
          rows={4}
        />
      </FieldWrapper>
      <FieldWrapper label="Location">
        <TextInput
          value={data.location ?? ''}
          onChange={(v) => onUpdate({ location: v })}
          placeholder="City, Country"
        />
      </FieldWrapper>
      <div className="flex items-center gap-3">
        <input
          type="checkbox"
          id="available"
          checked={data.availableForWork}
          onChange={(e) => onUpdate({ availableForWork: e.target.checked })}
          className="w-4 h-4 rounded accent-violet-500"
        />
        <label htmlFor="available" className="text-sm text-slate-400">
          Available for work
        </label>
      </div>
    </div>
  );
}

// ─── About ─────────────────────────────────────────────────────────────────

function AboutForm({
  data,
  onUpdate,
}: {
  data: AboutSection['data'];
  onUpdate: Update<AboutSection['data']>;
}) {
  return (
    <div className="space-y-4">
      <FieldWrapper label="Heading">
        <TextInput value={data.heading} onChange={(v) => onUpdate({ heading: v })} />
      </FieldWrapper>
      <FieldWrapper label="Bio">
        <TextareaInput
          value={data.bio}
          onChange={(v) => onUpdate({ bio: v })}
          placeholder="Tell your story..."
          rows={6}
        />
      </FieldWrapper>
    </div>
  );
}

// ─── Contact ───────────────────────────────────────────────────────────────

function ContactForm({
  data,
  onUpdate,
}: {
  data: ContactSection['data'];
  onUpdate: Update<ContactSection['data']>;
}) {
  return (
    <div className="space-y-4">
      <FieldWrapper label="Heading">
        <TextInput value={data.heading} onChange={(v) => onUpdate({ heading: v })} />
      </FieldWrapper>
      <FieldWrapper label="Email">
        <TextInput
          value={data.email ?? ''}
          onChange={(v) => onUpdate({ email: v })}
          placeholder="you@example.com"
        />
      </FieldWrapper>
      <FieldWrapper label="Location">
        <TextInput value={data.location ?? ''} onChange={(v) => onUpdate({ location: v })} />
      </FieldWrapper>
      <FieldWrapper label="GitHub URL">
        <TextInput
          value={data.socials?.github ?? ''}
          onChange={(v) => onUpdate({ socials: { ...data.socials, github: v } })}
          placeholder="https://github.com/..."
        />
      </FieldWrapper>
      <FieldWrapper label="LinkedIn URL">
        <TextInput
          value={data.socials?.linkedin ?? ''}
          onChange={(v) => onUpdate({ socials: { ...data.socials, linkedin: v } })}
          placeholder="https://linkedin.com/in/..."
        />
      </FieldWrapper>
      <FieldWrapper label="Twitter / X">
        <TextInput
          value={data.socials?.twitter ?? ''}
          onChange={(v) => onUpdate({ socials: { ...data.socials, twitter: v } })}
          placeholder="https://twitter.com/..."
        />
      </FieldWrapper>
      <div className="flex items-center gap-3">
        <input
          type="checkbox"
          id="showForm"
          checked={data.showContactForm}
          onChange={(e) => onUpdate({ showContactForm: e.target.checked })}
          className="w-4 h-4 rounded accent-violet-500"
        />
        <label htmlFor="showForm" className="text-sm text-slate-400">
          Show contact form
        </label>
      </div>
    </div>
  );
}

// ─── Experience ────────────────────────────────────────────────────────────

function ExperienceForm({
  data,
  onUpdate,
}: {
  data: ExperienceSection['data'];
  onUpdate: Update<ExperienceSection['data']>;
}) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const items: ExperienceItem[] = data.items ?? [];

  const updateItem = (id: string, patch: Partial<ExperienceItem>) => {
    onUpdate({ items: items.map((item) => (item.id === id ? { ...item, ...patch } : item)) });
  };

  const addItem = () => {
    const id = generateId();
    const newItem: ExperienceItem = {
      id,
      company: '',
      role: '',
      startDate: '',
      endDate: '',
      current: false,
      description: '',
      highlights: [],
      location: '',
      type: 'full-time',
    };
    onUpdate({ items: [...items, newItem] });
    setExpandedId(id);
  };

  const removeItem = (id: string) => {
    onUpdate({ items: items.filter((item) => item.id !== id) });
    if (expandedId === id) setExpandedId(null);
  };

  return (
    <div className="space-y-4">
      <FieldWrapper label="Heading">
        <TextInput
          value={data.heading ?? 'Experience'}
          onChange={(v) => onUpdate({ heading: v })}
        />
      </FieldWrapper>
      <FieldWrapper label="Layout">
        <SelectInput
          value={data.layout ?? 'timeline'}
          onChange={(v) => onUpdate({ layout: v as ExperienceSection['data']['layout'] })}
        >
          <option value="timeline">Timeline</option>
          <option value="cards">Cards</option>
        </SelectInput>
      </FieldWrapper>

      <div className="space-y-2">
        {items.map((item) => (
          <div key={item.id} className="rounded-lg overflow-hidden border border-slate-700/50">
            <ItemHeader
              title={item.role || '(no role)'}
              subtitle={item.company}
              expanded={expandedId === item.id}
              onToggle={() => setExpandedId(expandedId === item.id ? null : item.id)}
              onDelete={() => removeItem(item.id)}
            />
            {expandedId === item.id && (
              <div className="p-3 space-y-3 bg-slate-900 border-t border-slate-700/50">
                <FieldWrapper label="Company">
                  <TextInput
                    value={item.company}
                    onChange={(v) => updateItem(item.id, { company: v })}
                    placeholder="Acme Corp"
                  />
                </FieldWrapper>
                <FieldWrapper label="Role / Title">
                  <TextInput
                    value={item.role}
                    onChange={(v) => updateItem(item.id, { role: v })}
                    placeholder="Senior Engineer"
                  />
                </FieldWrapper>
                <FieldWrapper label="Type">
                  <SelectInput
                    value={item.type ?? 'full-time'}
                    onChange={(v) => updateItem(item.id, { type: v as ExperienceItem['type'] })}
                  >
                    <option value="full-time">Full-time</option>
                    <option value="part-time">Part-time</option>
                    <option value="contract">Contract</option>
                    <option value="internship">Internship</option>
                    <option value="freelance">Freelance</option>
                  </SelectInput>
                </FieldWrapper>
                <FieldWrapper label="Location">
                  <TextInput
                    value={item.location ?? ''}
                    onChange={(v) => updateItem(item.id, { location: v })}
                    placeholder="Remote"
                  />
                </FieldWrapper>
                <div className="grid grid-cols-2 gap-2">
                  <FieldWrapper label="Start Date">
                    <TextInput
                      value={item.startDate}
                      onChange={(v) => updateItem(item.id, { startDate: v })}
                      placeholder="Jan 2022"
                    />
                  </FieldWrapper>
                  <FieldWrapper label="End Date">
                    <TextInput
                      value={item.endDate ?? ''}
                      onChange={(v) => updateItem(item.id, { endDate: v })}
                      placeholder="Present"
                    />
                  </FieldWrapper>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={item.current}
                    onChange={(e) =>
                      updateItem(item.id, {
                        current: e.target.checked,
                        endDate: e.target.checked ? '' : item.endDate,
                      })
                    }
                    className="w-4 h-4 rounded accent-violet-500"
                  />
                  <span className="text-xs text-slate-400">Currently working here</span>
                </div>
                <FieldWrapper label="Description">
                  <TextareaInput
                    value={item.description ?? ''}
                    onChange={(v) => updateItem(item.id, { description: v })}
                    placeholder="What you did..."
                    rows={3}
                  />
                </FieldWrapper>
              </div>
            )}
          </div>
        ))}
        <AddButton onClick={addItem} label="Add Experience" />
      </div>
    </div>
  );
}

// ─── Education ─────────────────────────────────────────────────────────────

function EducationForm({
  data,
  onUpdate,
}: {
  data: EducationSection['data'];
  onUpdate: Update<EducationSection['data']>;
}) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const items: EducationItem[] = data.items ?? [];

  const updateItem = (id: string, patch: Partial<EducationItem>) => {
    onUpdate({ items: items.map((item) => (item.id === id ? { ...item, ...patch } : item)) });
  };

  const addItem = () => {
    const id = generateId();
    const newItem: EducationItem = {
      id,
      institution: '',
      degree: '',
      field: '',
      startDate: '',
      endDate: '',
      current: false,
      gpa: '',
      description: '',
    };
    onUpdate({ items: [...items, newItem] });
    setExpandedId(id);
  };

  const removeItem = (id: string) => {
    onUpdate({ items: items.filter((item) => item.id !== id) });
    if (expandedId === id) setExpandedId(null);
  };

  return (
    <div className="space-y-4">
      <FieldWrapper label="Heading">
        <TextInput value={data.heading ?? 'Education'} onChange={(v) => onUpdate({ heading: v })} />
      </FieldWrapper>

      <div className="space-y-2">
        {items.map((item) => (
          <div key={item.id} className="rounded-lg overflow-hidden border border-slate-700/50">
            <ItemHeader
              title={item.degree || '(no degree)'}
              subtitle={item.institution}
              expanded={expandedId === item.id}
              onToggle={() => setExpandedId(expandedId === item.id ? null : item.id)}
              onDelete={() => removeItem(item.id)}
            />
            {expandedId === item.id && (
              <div className="p-3 space-y-3 bg-slate-900 border-t border-slate-700/50">
                <FieldWrapper label="Institution">
                  <TextInput
                    value={item.institution}
                    onChange={(v) => updateItem(item.id, { institution: v })}
                    placeholder="MIT"
                  />
                </FieldWrapper>
                <FieldWrapper label="Degree">
                  <TextInput
                    value={item.degree}
                    onChange={(v) => updateItem(item.id, { degree: v })}
                    placeholder="Bachelor of Science"
                  />
                </FieldWrapper>
                <FieldWrapper label="Field of Study">
                  <TextInput
                    value={item.field ?? ''}
                    onChange={(v) => updateItem(item.id, { field: v })}
                    placeholder="Computer Science"
                  />
                </FieldWrapper>
                <div className="grid grid-cols-2 gap-2">
                  <FieldWrapper label="Start Date">
                    <TextInput
                      value={item.startDate}
                      onChange={(v) => updateItem(item.id, { startDate: v })}
                      placeholder="Sep 2018"
                    />
                  </FieldWrapper>
                  <FieldWrapper label="End Date">
                    <TextInput
                      value={item.endDate ?? ''}
                      onChange={(v) => updateItem(item.id, { endDate: v })}
                      placeholder="Jun 2022"
                    />
                  </FieldWrapper>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={item.current}
                    onChange={(e) => updateItem(item.id, { current: e.target.checked })}
                    className="w-4 h-4 rounded accent-violet-500"
                  />
                  <span className="text-xs text-slate-400">Currently studying here</span>
                </div>
                <FieldWrapper label="GPA">
                  <TextInput
                    value={item.gpa ?? ''}
                    onChange={(v) => updateItem(item.id, { gpa: v })}
                    placeholder="3.8 / 4.0"
                  />
                </FieldWrapper>
                <FieldWrapper label="Description">
                  <TextareaInput
                    value={item.description ?? ''}
                    onChange={(v) => updateItem(item.id, { description: v })}
                    placeholder="Notable achievements..."
                    rows={2}
                  />
                </FieldWrapper>
              </div>
            )}
          </div>
        ))}
        <AddButton onClick={addItem} label="Add Education" />
      </div>
    </div>
  );
}

// ─── Projects ──────────────────────────────────────────────────────────────

function ProjectsForm({
  data,
  onUpdate,
}: {
  data: ProjectsSection['data'];
  onUpdate: Update<ProjectsSection['data']>;
}) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const items: Project[] = data.items ?? [];

  const updateItem = (id: string, patch: Partial<Project>) => {
    onUpdate({ items: items.map((item) => (item.id === id ? { ...item, ...patch } : item)) });
  };

  const addItem = () => {
    const id = generateId();
    const newItem: Project = {
      id,
      title: '',
      description: '',
      tags: [],
      liveUrl: '',
      repoUrl: '',
      featured: false,
      status: 'completed',
      year: new Date().getFullYear(),
    };
    onUpdate({ items: [...items, newItem] });
    setExpandedId(id);
  };

  const removeItem = (id: string) => {
    onUpdate({ items: items.filter((item) => item.id !== id) });
    if (expandedId === id) setExpandedId(null);
  };

  return (
    <div className="space-y-4">
      <FieldWrapper label="Heading">
        <TextInput value={data.heading ?? 'Projects'} onChange={(v) => onUpdate({ heading: v })} />
      </FieldWrapper>
      <FieldWrapper label="Subheading">
        <TextInput
          value={data.subheading ?? ''}
          onChange={(v) => onUpdate({ subheading: v })}
          placeholder="Things I've built"
        />
      </FieldWrapper>
      <div className="grid grid-cols-2 gap-2">
        <FieldWrapper label="Layout">
          <SelectInput
            value={data.layout ?? 'grid'}
            onChange={(v) => onUpdate({ layout: v as ProjectsSection['data']['layout'] })}
          >
            <option value="grid">Grid</option>
            <option value="list">List</option>
            <option value="masonry">Masonry</option>
          </SelectInput>
        </FieldWrapper>
        <div className="flex items-end pb-2">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={data.showFeaturedOnly ?? false}
              onChange={(e) => onUpdate({ showFeaturedOnly: e.target.checked })}
              className="w-4 h-4 rounded accent-violet-500"
            />
            <span className="text-xs text-slate-400">Featured only</span>
          </label>
        </div>
      </div>

      <div className="space-y-2">
        {items.map((item) => (
          <div key={item.id} className="rounded-lg overflow-hidden border border-slate-700/50">
            <ItemHeader
              title={item.title || '(untitled)'}
              subtitle={item.status}
              expanded={expandedId === item.id}
              onToggle={() => setExpandedId(expandedId === item.id ? null : item.id)}
              onDelete={() => removeItem(item.id)}
            />
            {expandedId === item.id && (
              <div className="p-3 space-y-3 bg-slate-900 border-t border-slate-700/50">
                <FieldWrapper label="Title">
                  <TextInput
                    value={item.title}
                    onChange={(v) => updateItem(item.id, { title: v })}
                    placeholder="My Awesome Project"
                  />
                </FieldWrapper>
                <FieldWrapper label="Description">
                  <TextareaInput
                    value={item.description}
                    onChange={(v) => updateItem(item.id, { description: v })}
                    placeholder="What this project does..."
                    rows={3}
                  />
                </FieldWrapper>
                <FieldWrapper label="Tags (comma-separated)">
                  <TagsInput
                    value={item.tags ?? []}
                    onChange={(tags) => updateItem(item.id, { tags })}
                    placeholder="React, Node.js, PostgreSQL"
                  />
                </FieldWrapper>
                <FieldWrapper label="Live URL">
                  <TextInput
                    value={item.liveUrl ?? ''}
                    onChange={(v) => updateItem(item.id, { liveUrl: v })}
                    placeholder="https://myproject.com"
                  />
                </FieldWrapper>
                <FieldWrapper label="Repo URL">
                  <TextInput
                    value={item.repoUrl ?? ''}
                    onChange={(v) => updateItem(item.id, { repoUrl: v })}
                    placeholder="https://github.com/..."
                  />
                </FieldWrapper>
                <div className="grid grid-cols-2 gap-2">
                  <FieldWrapper label="Year">
                    <TextInput
                      value={item.year?.toString() ?? ''}
                      onChange={(v) => updateItem(item.id, { year: parseInt(v) || undefined })}
                      placeholder="2024"
                    />
                  </FieldWrapper>
                  <FieldWrapper label="Status">
                    <SelectInput
                      value={item.status ?? 'completed'}
                      onChange={(v) => updateItem(item.id, { status: v as Project['status'] })}
                    >
                      <option value="completed">Completed</option>
                      <option value="in-progress">In Progress</option>
                      <option value="archived">Archived</option>
                    </SelectInput>
                  </FieldWrapper>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={item.featured ?? false}
                    onChange={(e) => updateItem(item.id, { featured: e.target.checked })}
                    className="w-4 h-4 rounded accent-violet-500"
                  />
                  <span className="text-xs text-slate-400">Featured project</span>
                </div>
              </div>
            )}
          </div>
        ))}
        <AddButton onClick={addItem} label="Add Project" />
      </div>
    </div>
  );
}

// ─── Skills ────────────────────────────────────────────────────────────────

function SkillsForm({
  data,
  onUpdate,
}: {
  data: SkillsSection['data'];
  onUpdate: Update<SkillsSection['data']>;
}) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const items: Skill[] = data.items ?? [];

  const updateItem = (id: string, patch: Partial<Skill>) => {
    onUpdate({ items: items.map((item) => (item.id === id ? { ...item, ...patch } : item)) });
  };

  const addItem = () => {
    const id = generateId();
    const newItem: Skill = { id, name: '', category: '', level: 80 };
    onUpdate({ items: [...items, newItem] });
    setExpandedId(id);
  };

  const removeItem = (id: string) => {
    onUpdate({ items: items.filter((item) => item.id !== id) });
    if (expandedId === id) setExpandedId(null);
  };

  return (
    <div className="space-y-4">
      <FieldWrapper label="Heading">
        <TextInput value={data.heading ?? 'Skills'} onChange={(v) => onUpdate({ heading: v })} />
      </FieldWrapper>
      <FieldWrapper label="Subheading">
        <TextInput
          value={data.subheading ?? ''}
          onChange={(v) => onUpdate({ subheading: v })}
          placeholder="Technologies I work with"
        />
      </FieldWrapper>
      <div className="grid grid-cols-2 gap-2">
        <FieldWrapper label="Layout">
          <SelectInput
            value={data.layout ?? 'tags'}
            onChange={(v) => onUpdate({ layout: v as SkillsSection['data']['layout'] })}
          >
            <option value="tags">Tags</option>
            <option value="bars">Bars</option>
            <option value="grid">Grid</option>
          </SelectInput>
        </FieldWrapper>
        <div className="flex items-end pb-2">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={data.showLevels ?? false}
              onChange={(e) => onUpdate({ showLevels: e.target.checked })}
              className="w-4 h-4 rounded accent-violet-500"
            />
            <span className="text-xs text-slate-400">Show levels</span>
          </label>
        </div>
      </div>

      <div className="space-y-2">
        {items.map((item) => (
          <div key={item.id} className="rounded-lg overflow-hidden border border-slate-700/50">
            <ItemHeader
              title={item.name || '(unnamed)'}
              subtitle={item.category || undefined}
              expanded={expandedId === item.id}
              onToggle={() => setExpandedId(expandedId === item.id ? null : item.id)}
              onDelete={() => removeItem(item.id)}
            />
            {expandedId === item.id && (
              <div className="p-3 space-y-3 bg-slate-900 border-t border-slate-700/50">
                <FieldWrapper label="Skill Name">
                  <TextInput
                    value={item.name}
                    onChange={(v) => updateItem(item.id, { name: v })}
                    placeholder="TypeScript"
                  />
                </FieldWrapper>
                <FieldWrapper label="Category">
                  <TextInput
                    value={item.category ?? ''}
                    onChange={(v) => updateItem(item.id, { category: v })}
                    placeholder="Languages"
                  />
                </FieldWrapper>
                {(data.showLevels ?? false) && (
                  <FieldWrapper label={`Proficiency: ${item.level ?? 80}%`}>
                    <input
                      type="range"
                      min={0}
                      max={100}
                      value={item.level ?? 80}
                      onChange={(e) => updateItem(item.id, { level: parseInt(e.target.value) })}
                      className="w-full accent-violet-500"
                    />
                  </FieldWrapper>
                )}
              </div>
            )}
          </div>
        ))}
        <AddButton onClick={addItem} label="Add Skill" />
      </div>
    </div>
  );
}
