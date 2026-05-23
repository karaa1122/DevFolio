'use client';

import { useResumeStore } from '@/store/resume.store';
import {
  RESUME_TEMPLATE_IDS,
  type ResumeTemplateId,
  type ResumeTheme,
} from '@devfolio/shared';
import { Field } from './forms/primitives';

const ACCENT_PRESETS = [
  '#0f172a',
  '#1f2937',
  '#2563eb',
  '#0ea5e9',
  '#14b8a6',
  '#16a34a',
  '#7c3aed',
  '#db2777',
  '#dc2626',
  '#ea580c',
];

const FONT_OPTIONS: { id: ResumeTheme['font']; label: string; family: string }[] = [
  { id: 'inter', label: 'Inter', family: "'Inter', sans-serif" },
  { id: 'source-sans', label: 'Source Sans', family: "'Source Sans 3', sans-serif" },
  { id: 'ibm-plex-sans', label: 'IBM Plex', family: "'IBM Plex Sans', sans-serif" },
  { id: 'lora', label: 'Lora', family: "'Lora', serif" },
  { id: 'merriweather', label: 'Merriweather', family: "'Merriweather', serif" },
  { id: 'jetbrains-mono', label: 'JetBrains', family: "'JetBrains Mono', monospace" },
];

const TEMPLATE_LABEL: Record<ResumeTemplateId, string> = {
  classic: 'Classic',
  modern: 'Modern',
  compact: 'Compact',
  sidebar: 'Sidebar',
  'two-column': 'Two col',
  'dev-focus': 'Dev focus',
};

export function DesignPanel() {
  const { resume, setTemplate, updateTheme, updatePage, setDensity, setAts } = useResumeStore();
  if (!resume) return null;

  return (
    <div className="p-4 space-y-6">
      <Field label="Template">
        <div className="grid grid-cols-3 gap-2">
          {RESUME_TEMPLATE_IDS.map((id) => (
            <TemplateThumb
              key={id}
              id={id}
              label={TEMPLATE_LABEL[id]}
              accent={resume.theme.accent}
              selected={resume.template === id}
              onClick={() => setTemplate(id)}
            />
          ))}
        </div>
      </Field>

      <Field label="Accent">
        <div className="flex flex-wrap gap-1.5">
          {ACCENT_PRESETS.map((c) => (
            <button
              key={c}
              onClick={() => updateTheme({ accent: c })}
              className={`w-7 h-7 rounded-full transition-all relative ${
                resume.theme.accent === c
                  ? 'ring-2 ring-offset-2 ring-offset-slate-950 ring-white scale-105'
                  : 'hover:scale-110'
              }`}
              style={{ backgroundColor: c }}
              aria-label={`Use ${c}`}
            />
          ))}
          <label
            className="w-7 h-7 rounded-full border border-dashed border-slate-700 hover:border-slate-500 cursor-pointer grid place-items-center text-slate-500 hover:text-slate-300 transition-colors"
            title="Custom color"
          >
            <span className="text-xs leading-none">+</span>
            <input
              type="color"
              value={resume.theme.accent}
              onChange={(e) => updateTheme({ accent: e.target.value })}
              className="sr-only"
            />
          </label>
        </div>
      </Field>

      <Field label="Font">
        <div className="grid grid-cols-3 gap-1.5">
          {FONT_OPTIONS.map((f) => (
            <button
              key={f.id}
              onClick={() => updateTheme({ font: f.id })}
              className={`px-2 py-2.5 rounded-lg text-[11px] border transition-colors flex flex-col items-center gap-0.5 ${
                resume.theme.font === f.id
                  ? 'bg-violet-500/15 border-violet-500/60 text-violet-100'
                  : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700'
              }`}
            >
              <span
                className="text-base font-semibold leading-none mb-0.5"
                style={{ fontFamily: f.family }}
              >
                Aa
              </span>
              <span className="text-[10px]">{f.label}</span>
            </button>
          ))}
        </div>
      </Field>

      <SegmentedField
        label="Size"
        options={['xs', 'sm', 'md', 'lg']}
        value={resume.theme.fontSize}
        onChange={(v) => updateTheme({ fontSize: v as ResumeTheme['fontSize'] })}
      />

      <SegmentedField
        label="Line height"
        options={['tight', 'normal', 'relaxed']}
        value={resume.theme.lineHeight}
        onChange={(v) => updateTheme({ lineHeight: v as ResumeTheme['lineHeight'] })}
      />

      <SegmentedField
        label="Section spacing"
        options={['compact', 'normal', 'relaxed']}
        value={resume.density}
        onChange={(v) => setDensity(v as 'compact' | 'normal' | 'relaxed')}
      />

      <div className="pt-4 border-t border-slate-800/70 space-y-5">
        <SegmentedField
          label="Page format"
          options={['A4', 'Letter']}
          value={resume.page.format}
          onChange={(v) => updatePage({ format: v as 'A4' | 'Letter' })}
        />
        <SegmentedField
          label="Page margins"
          options={['narrow', 'normal', 'wide']}
          value={resume.page.margin}
          onChange={(v) => updatePage({ margin: v as 'narrow' | 'normal' | 'wide' })}
        />
      </div>

      <div className="pt-4 border-t border-slate-800/70">
        <label className="flex items-start gap-3 cursor-pointer p-3 rounded-lg bg-slate-900/60 border border-slate-800 hover:border-slate-700 transition-colors">
          <input
            type="checkbox"
            checked={resume.ats}
            onChange={(e) => setAts(e.target.checked)}
            className="mt-0.5 accent-violet-500"
          />
          <div className="flex-1">
            <div className="text-sm font-medium text-slate-100 flex items-center gap-1.5">
              ATS-safe mode
              <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                BETA
              </span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
              Forces single-column, system font, pure black text. Use this for jobs that route
              through applicant-tracking software.
            </p>
          </div>
        </label>
      </div>
    </div>
  );
}

function SegmentedField({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: readonly string[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <Field label={label}>
      <div
        className="grid gap-1 p-0.5 rounded-lg bg-slate-900/60 border border-slate-800"
        style={{ gridTemplateColumns: `repeat(${options.length}, 1fr)` }}
      >
        {options.map((opt) => (
          <button
            key={opt}
            onClick={() => onChange(opt)}
            className={`px-2 py-1.5 rounded-md text-[11px] font-medium capitalize transition-colors ${
              value === opt
                ? 'bg-slate-700/70 text-slate-100 shadow-sm'
                : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            {opt}
          </button>
        ))}
      </div>
    </Field>
  );
}

function TemplateThumb({
  id,
  label,
  accent,
  selected,
  onClick,
}: {
  id: ResumeTemplateId;
  label: string;
  accent: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`group relative aspect-[3/4] rounded-lg border overflow-hidden transition-all ${
        selected
          ? 'border-violet-500 ring-2 ring-violet-500/30 ring-offset-2 ring-offset-slate-950'
          : 'border-slate-800 hover:border-slate-600'
      }`}
      title={label}
    >
      <div className="absolute inset-0 bg-white">
        <TemplatePreview id={id} accent={accent} />
      </div>
      <div className="absolute bottom-0 inset-x-0 px-1.5 py-1 bg-gradient-to-t from-black/60 to-transparent">
        <div
          className={`text-[10px] font-medium text-center ${
            selected ? 'text-violet-100' : 'text-white/90'
          }`}
        >
          {label}
        </div>
      </div>
    </button>
  );
}

// Tiny SVG mockups so the template selector communicates layout at a glance —
// no need to render the full ResumeRenderer at thumbnail size (way too heavy).
function TemplatePreview({ id, accent }: { id: ResumeTemplateId; accent: string }) {
  const grey = '#94a3b8';
  const dark = '#334155';
  switch (id) {
    case 'classic':
      return (
        <svg viewBox="0 0 60 80" className="w-full h-full">
          <text x="30" y="11" fontSize="6" textAnchor="middle" fontWeight="700" fill={dark}>NAME</text>
          <line x1="6" y1="14" x2="54" y2="14" stroke={grey} strokeWidth="0.3" />
          {[20, 34, 48, 62].map((y) => (
            <g key={y}>
              <text x="6" y={y} fontSize="3" fontWeight="700" fill={dark}>SECTION</text>
              <line x1="6" y1={y + 1.5} x2="54" y2={y + 1.5} stroke={grey} strokeWidth="0.3" />
              <rect x="6" y={y + 4} width="42" height="0.8" fill={grey} opacity="0.6" />
              <rect x="6" y={y + 6.5} width="46" height="0.8" fill={grey} opacity="0.5" />
              <rect x="6" y={y + 9} width="36" height="0.8" fill={grey} opacity="0.5" />
            </g>
          ))}
        </svg>
      );
    case 'modern':
      return (
        <svg viewBox="0 0 60 80" className="w-full h-full">
          <text x="6" y="13" fontSize="8" fontWeight="800" fill={dark}>NAME</text>
          <text x="6" y="18" fontSize="3" fill={accent}>Role</text>
          {[28, 44, 60].map((y) => (
            <g key={y}>
              <rect x="6" y={y - 1.5} width="0.8" height="4.5" fill={accent} />
              <text x="9" y={y + 1} fontSize="3" fontWeight="700" fill={dark}>SECTION</text>
              <rect x="6" y={y + 4} width="46" height="0.8" fill={grey} opacity="0.6" />
              <rect x="6" y={y + 6.5} width="42" height="0.8" fill={grey} opacity="0.5" />
            </g>
          ))}
        </svg>
      );
    case 'compact':
      return (
        <svg viewBox="0 0 60 80" className="w-full h-full">
          <text x="6" y="9" fontSize="5" fontWeight="700" fill={dark}>NAME</text>
          {[16, 24, 32, 40, 48, 56, 64].map((y) => (
            <g key={y}>
              <text x="6" y={y} fontSize="2.5" fontWeight="700" fill={dark}>SECTION</text>
              <rect x="22" y={y - 2} width="32" height="0.7" fill={grey} opacity="0.6" />
              <rect x="22" y={y - 0.5} width="28" height="0.7" fill={grey} opacity="0.5" />
            </g>
          ))}
        </svg>
      );
    case 'sidebar':
      return (
        <svg viewBox="0 0 60 80" className="w-full h-full">
          <rect x="0" y="0" width="60" height="14" fill={accent} />
          <text x="6" y="9" fontSize="4" fontWeight="700" fill="#fff">NAME</text>
          <rect x="4" y="18" width="18" height="58" fill={accent} opacity="0.1" rx="1" />
          <text x="6" y="23" fontSize="2.5" fontWeight="700" fill={accent}>SKILLS</text>
          {[27, 31, 35, 39].map((y) => (
            <rect key={y} x="6" y={y} width="14" height="0.7" fill={grey} opacity="0.6" />
          ))}
          <text x="6" y="46" fontSize="2.5" fontWeight="700" fill={accent}>LANGS</text>
          {[50, 54, 58].map((y) => (
            <rect key={y} x="6" y={y} width="14" height="0.7" fill={grey} opacity="0.6" />
          ))}
          {[20, 38, 56].map((y) => (
            <g key={y}>
              <text x="26" y={y} fontSize="3" fontWeight="700" fill={dark}>SECTION</text>
              <rect x="26" y={y + 2.5} width="28" height="0.7" fill={grey} opacity="0.6" />
              <rect x="26" y={y + 4.5} width="24" height="0.7" fill={grey} opacity="0.5" />
              <rect x="26" y={y + 6.5} width="26" height="0.7" fill={grey} opacity="0.5" />
            </g>
          ))}
        </svg>
      );
    case 'two-column':
      return (
        <svg viewBox="0 0 60 80" className="w-full h-full">
          <text x="30" y="10" fontSize="5" textAnchor="middle" fontWeight="700" fill={dark}>NAME</text>
          <line x1="6" y1="14" x2="54" y2="14" stroke={accent} strokeWidth="0.4" />
          {[22, 38, 54].map((y) => (
            <g key={y}>
              <text x="6" y={y} fontSize="2.6" fontWeight="700" fill={accent}>LEFT</text>
              <rect x="6" y={y + 2} width="24" height="0.7" fill={grey} opacity="0.6" />
              <rect x="6" y={y + 4} width="22" height="0.7" fill={grey} opacity="0.5" />
              <rect x="6" y={y + 6} width="24" height="0.7" fill={grey} opacity="0.5" />

              <text x="34" y={y} fontSize="2.6" fontWeight="700" fill={accent}>RIGHT</text>
              <rect x="34" y={y + 2} width="20" height="0.7" fill={grey} opacity="0.6" />
              <rect x="34" y={y + 4} width="18" height="0.7" fill={grey} opacity="0.5" />
            </g>
          ))}
        </svg>
      );
    case 'dev-focus':
      return (
        <svg viewBox="0 0 60 80" className="w-full h-full" fontFamily="monospace">
          <text x="6" y="10" fontSize="5" fontWeight="700" fill={dark}>name</text>
          <text x="6" y="14.5" fontSize="2.6" fill={accent}>engineer</text>
          <line x1="6" y1="17" x2="54" y2="17" stroke={grey} strokeWidth="0.3" strokeDasharray="1 1" />
          {[24, 40, 56].map((y) => (
            <g key={y}>
              <text x="6" y={y} fontSize="2.8" fontWeight="700" fill={dark}>
                <tspan fill={accent}>{'>'}</tspan> section
              </text>
              <rect x="6" y={y + 2.5} width="42" height="0.7" fill={grey} opacity="0.6" />
              <rect x="6" y={y + 4.5} width="38" height="0.7" fill={grey} opacity="0.5" />
              <g transform={`translate(6, ${y + 7})`}>
                <rect width="6" height="2.5" rx="0.5" fill="none" stroke={grey} strokeWidth="0.3" />
                <rect x="7" width="7" height="2.5" rx="0.5" fill="none" stroke={grey} strokeWidth="0.3" />
                <rect x="15" width="5" height="2.5" rx="0.5" fill="none" stroke={grey} strokeWidth="0.3" />
              </g>
            </g>
          ))}
        </svg>
      );
  }
}
