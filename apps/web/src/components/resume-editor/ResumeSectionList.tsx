'use client';

import { useResumeStore } from '@/store/resume.store';
import { RESUME_SECTION_TYPES, type ResumeSectionType } from '@devfolio/shared';
import { generateId } from '@/lib/utils';

const SECTION_LABELS: Record<ResumeSectionType, string> = {
  contact: 'Contact',
  summary: 'Summary',
  experience: 'Experience',
  education: 'Education',
  skills: 'Skills',
  projects: 'Projects',
  certifications: 'Certifications',
};

const SINGLETON_TYPES: ResumeSectionType[] = ['contact', 'summary'];

const defaultData: Record<ResumeSectionType, object> = {
  contact: { name: '', email: '', phone: '', location: '' },
  summary: { heading: 'Professional Summary', text: '' },
  experience: { heading: 'Experience', items: [] },
  education: { heading: 'Education', items: [] },
  skills: { heading: 'Skills', items: [] },
  projects: { heading: 'Projects', items: [] },
  certifications: { heading: 'Certifications', items: [] },
};

export function ResumeSectionList() {
  const { resume, selectSection, addSection, removeSection, updateSectionVisibility, reorderSections } = useResumeStore();
  if (!resume) return null;

  const order = resume.layout.sectionsOrder;
  const ordered = order
    .map((id) => resume.sections.find((s) => s.id === id))
    .filter((s): s is NonNullable<typeof s> => s !== undefined);

  const existingTypes = new Set(resume.sections.map((s) => s.type));

  return (
    <div className="p-4 space-y-4">
      {/* Existing sections */}
      <div className="space-y-1">
        <p className="text-xs text-slate-500 uppercase tracking-wider mb-2">Sections</p>
        {ordered.map((section, idx) => (
          <div
            key={section.id}
            className="flex items-center gap-2 bg-slate-800/60 hover:bg-slate-800 rounded-lg px-3 py-2 group transition-colors"
          >
            <div className="flex flex-col gap-0.5 text-slate-600">
              <button
                disabled={idx === 0}
                onClick={() => reorderSections(idx, idx - 1)}
                className="text-[10px] leading-none hover:text-slate-400 disabled:opacity-20"
              >
                ▲
              </button>
              <button
                disabled={idx === ordered.length - 1}
                onClick={() => reorderSections(idx, idx + 1)}
                className="text-[10px] leading-none hover:text-slate-400 disabled:opacity-20"
              >
                ▼
              </button>
            </div>

            <button
              onClick={() => selectSection(section.id)}
              className="flex-1 text-left text-sm text-slate-300 font-medium"
            >
              {SECTION_LABELS[section.type as ResumeSectionType] ?? section.type}
            </button>

            <button
              onClick={() => updateSectionVisibility(section.id, !section.visible)}
              className={`text-xs opacity-0 group-hover:opacity-100 transition-opacity ${section.visible ? 'text-slate-500' : 'text-slate-600 line-through'}`}
              title={section.visible ? 'Hide' : 'Show'}
            >
              {section.visible ? '●' : '○'}
            </button>

            {!SINGLETON_TYPES.includes(section.type as ResumeSectionType) && (
              <button
                onClick={() => removeSection(section.id)}
                className="text-xs text-red-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                ✕
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Add section */}
      <div>
        <p className="text-xs text-slate-500 uppercase tracking-wider mb-2">Add Section</p>
        <div className="grid grid-cols-2 gap-2">
          {RESUME_SECTION_TYPES.map((type) => {
            const disabled = SINGLETON_TYPES.includes(type) && existingTypes.has(type);
            return (
              <button
                key={type}
                disabled={disabled}
                onClick={() =>
                  addSection({ id: generateId(), type, visible: true, data: defaultData[type] } as Parameters<typeof addSection>[0])
                }
                className="py-2 px-3 bg-slate-800 hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed rounded-lg text-xs text-slate-400 hover:text-slate-200 transition-colors text-left"
              >
                + {SECTION_LABELS[type]}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
