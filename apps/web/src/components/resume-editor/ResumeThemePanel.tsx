'use client';

import React, { useState } from 'react';
import { useResumeStore } from '@/store/resume.store';
import { FONTS, type FontCategory } from '@/lib/resume-fonts';
import { RESUME_PRESETS } from '@/lib/resume-presets';
import type { ResumeTheme } from '@devfolio/shared';

// ─── Shared primitives ─────────────────────────────────────────────────────────

const SECTION = 'mb-7';
const HEAD = 'text-xs font-bold text-slate-500 uppercase tracking-widest mb-3';

function Row({ label, right, children }: { label: string; right?: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="mb-4">
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-xs font-semibold text-slate-700">{label}</span>
        {right && <span className="text-xs font-mono text-violet-600 tabular-nums">{right}</span>}
      </div>
      {children}
    </div>
  );
}

function Slider({
  value, min, max, step = 0.5,
  onChange,
}: {
  value: number; min: number; max: number; step?: number;
  onChange: (v: number) => void;
}) {
  return (
    <div className="flex items-center gap-2">
      <button
        onClick={() => onChange(Math.max(min, +(value - step).toFixed(2)))}
        className="w-6 h-6 flex items-center justify-center rounded bg-slate-100 hover:bg-slate-200 text-slate-600 text-sm font-bold transition-colors shrink-0"
      >−</button>
      <input
        type="range"
        min={min} max={max} step={step}
        value={value}
        onChange={e => onChange(parseFloat(e.target.value))}
        className="flex-1 h-1.5 accent-violet-600 cursor-pointer"
      />
      <button
        onClick={() => onChange(Math.min(max, +(value + step).toFixed(2)))}
        className="w-6 h-6 flex items-center justify-center rounded bg-slate-100 hover:bg-slate-200 text-slate-600 text-sm font-bold transition-colors shrink-0"
      >+</button>
    </div>
  );
}

// ─── Accent presets ────────────────────────────────────────────────────────────

const ACCENT_PRESETS = [
  '#1d4ed8', // blue
  '#7c3aed', // violet
  '#059669', // emerald
  '#0891b2', // cyan
  '#dc2626', // red
  '#d97706', // amber
  '#be185d', // pink
  '#374151', // gray
  '#7f1d1d', // dark red
  '#1e3a5f', // navy
  '#166534', // forest
  '#1e293b', // slate-dark
];

// ─── Heading style picker ──────────────────────────────────────────────────────

type HeadingStyleId = ResumeTheme['headingStyle'];

interface HStyleDef {
  id: HeadingStyleId;
  label: string;
  render: (accent: string) => React.ReactNode;
}

const HEADING_STYLES: HStyleDef[] = [
  {
    id: 'underline',
    label: 'Underline',
    render: (a) => (
      <div className="p-2 w-full h-full flex flex-col justify-center">
        <div className="text-[9px] font-bold uppercase text-slate-800">HEADING</div>
        <div className="h-0.5 w-full mt-0.5" style={{ backgroundColor: a }} />
      </div>
    ),
  },
  {
    id: 'overline',
    label: 'Overline',
    render: (a) => (
      <div className="p-2 w-full h-full flex flex-col justify-center">
        <div className="h-0.5 w-full mb-0.5" style={{ backgroundColor: a }} />
        <div className="text-[9px] font-bold uppercase text-slate-800">HEADING</div>
      </div>
    ),
  },
  {
    id: 'filled',
    label: 'Filled',
    render: (a) => (
      <div className="w-full h-full flex items-center justify-center" style={{ backgroundColor: a }}>
        <div className="text-[9px] font-bold uppercase text-white px-1">HEADING</div>
      </div>
    ),
  },
  {
    id: 'leftbar',
    label: 'Left Bar',
    render: (a) => (
      <div className="w-full h-full flex items-center gap-1.5 px-1">
        <div className="w-0.5 h-4 rounded-full" style={{ backgroundColor: a }} />
        <div className="text-[9px] font-bold uppercase text-slate-800">HEADING</div>
      </div>
    ),
  },
  {
    id: 'simple',
    label: 'Simple',
    render: () => (
      <div className="w-full h-full flex items-center justify-center">
        <div className="text-[9px] font-bold uppercase text-slate-800">HEADING</div>
      </div>
    ),
  },
  {
    id: 'double',
    label: 'Double',
    render: (a) => (
      <div className="p-2 w-full h-full flex flex-col justify-center">
        <div className="text-[9px] font-bold uppercase text-slate-800">HEADING</div>
        <div className="h-px w-full mt-0.5" style={{ backgroundColor: a }} />
        <div className="h-px w-full mt-px opacity-40" style={{ backgroundColor: a }} />
      </div>
    ),
  },
  {
    id: 'dashed',
    label: 'Dashed',
    render: (a) => (
      <div className="p-2 w-full h-full flex flex-col justify-center">
        <div className="text-[9px] font-bold uppercase text-slate-800">HEADING</div>
        <div className="border-b border-dashed mt-0.5" style={{ borderColor: a }} />
      </div>
    ),
  },
  {
    id: 'none',
    label: 'None',
    render: () => (
      <div className="w-full h-full flex items-center justify-center">
        <div className="text-[9px] font-semibold text-slate-500">heading</div>
      </div>
    ),
  },
];

// ─── Main panel ────────────────────────────────────────────────────────────────

export function ResumeThemePanel() {
  const { resume, updateTheme } = useResumeStore();
  const [fontTab, setFontTab] = useState<FontCategory>('sans');

  if (!resume) return null;

  const t = resume.theme;
  const accent = t.accent ?? '#2563eb';
  const up = (patch: Partial<ResumeTheme>) => updateTheme(patch);

  const fontsByCategory = FONTS.filter(f => f.category === fontTab);

  return (
    <div className="p-4 pb-8 overflow-y-auto">

      {/* ── Quick Start Presets ─────────────────────────────────────────────── */}
      <div className={SECTION}>
        <p className={HEAD}>Quick Start</p>
        <div className="grid grid-cols-3 gap-2">
          {RESUME_PRESETS.map(preset => (
            <button
              key={preset.id}
              onClick={() => up(preset.theme as Partial<ResumeTheme>)}
              className="flex flex-col rounded-xl border-2 border-slate-200 hover:border-violet-300 overflow-hidden text-left transition-all hover:shadow-md group"
            >
              <div
                className="h-10 w-full"
                style={{ background: `linear-gradient(135deg, ${preset.colors[1]} 0%, ${preset.colors[0]}22 100%)`, borderBottom: `3px solid ${preset.colors[0]}` }}
              />
              <div className="px-2 py-1.5 bg-white group-hover:bg-slate-50 transition-colors">
                <div className="text-xs font-bold text-slate-800">{preset.name}</div>
                <div className="text-[10px] text-slate-400 mt-0.5 leading-tight">{preset.description}</div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* ── Layout Template ────────────────────────────────────────────────── */}
      <div className={SECTION}>
        <p className={HEAD}>Layout</p>
        <div className="flex gap-2">
          {(['classic', 'modern', 'minimal'] as const).map(tpl => (
            <button
              key={tpl}
              onClick={() => up({ template: tpl })}
              className={`flex-1 py-2 rounded-xl text-xs font-semibold border-2 capitalize transition-all ${
                (t.template ?? 'classic') === tpl
                  ? 'bg-violet-600 text-white border-violet-600 shadow-sm'
                  : 'bg-white text-slate-600 border-slate-200 hover:border-violet-300'
              }`}
            >
              {tpl}
            </button>
          ))}
        </div>
      </div>

      {/* ── Colors ─────────────────────────────────────────────────────────── */}
      <div className={SECTION}>
        <p className={HEAD}>Accent Color</p>
        <div className="flex flex-wrap gap-2 mb-3">
          {ACCENT_PRESETS.map(c => (
            <button
              key={c}
              onClick={() => up({ accent: c })}
              title={c}
              className={`w-7 h-7 rounded-full border-2 transition-transform hover:scale-110 ${
                accent.toLowerCase() === c.toLowerCase() ? 'border-slate-700 scale-110' : 'border-transparent'
              }`}
              style={{ backgroundColor: c }}
            />
          ))}
        </div>
        <div className="flex items-center gap-2">
          <input
            type="color"
            value={accent}
            onChange={e => up({ accent: e.target.value })}
            className="w-9 h-9 rounded-lg border border-slate-200 cursor-pointer bg-white p-0.5 shrink-0"
          />
          <input
            className="flex-1 bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 font-mono focus:outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100 transition-all"
            value={accent}
            onChange={e => up({ accent: e.target.value })}
            placeholder="#2563eb"
            maxLength={7}
          />
        </div>
      </div>

      {/* ── Font ──────────────────────────────────────────────────────────── */}
      <div className={SECTION}>
        <p className={HEAD}>Font</p>

        {/* Category tabs */}
        <div className="flex gap-1 mb-3 bg-slate-100 p-1 rounded-xl">
          {(['sans', 'serif', 'mono'] as FontCategory[]).map(cat => (
            <button
              key={cat}
              onClick={() => setFontTab(cat)}
              className={`flex-1 py-1.5 rounded-lg text-xs font-semibold capitalize transition-colors ${
                fontTab === cat ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500'
              }`}
            >
              {cat === 'sans' ? 'Sans' : cat === 'serif' ? 'Serif' : 'Mono'}
            </button>
          ))}
        </div>

        {/* Font list */}
        <div className="grid grid-cols-2 gap-1.5">
          {fontsByCategory.map(font => {
            const active = (t.font ?? 'inter') === font.id;
            return (
              <button
                key={font.id}
                onClick={() => up({ font: font.id })}
                className={`px-3 py-2 rounded-lg border text-left transition-all ${
                  active
                    ? 'border-violet-400 bg-violet-50 text-violet-700 font-semibold'
                    : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                }`}
              >
                <span className="text-xs truncate">{font.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Spacing ──────────────────────────────────────────────────────── */}
      <div className={SECTION}>
        <p className={HEAD}>Spacing</p>

        <Row label="Font Size" right={`${t.fontSize ?? 11.5}pt`}>
          <Slider value={t.fontSize ?? 11.5} min={7} max={16} step={0.5} onChange={v => up({ fontSize: v })} />
        </Row>

        <Row label="Line Height" right={(t.lineHeight ?? 1.55).toFixed(2)}>
          <Slider value={t.lineHeight ?? 1.55} min={1.0} max={2.5} step={0.05} onChange={v => up({ lineHeight: v })} />
        </Row>

        <Row label="Left & Right Margin" right={`${Math.round((t.marginH ?? 52) / 3.78)}mm`}>
          <Slider value={t.marginH ?? 52} min={20} max={80} step={2} onChange={v => up({ marginH: v })} />
        </Row>

        <Row label="Top & Bottom Margin" right={`${Math.round((t.marginV ?? 48) / 3.78)}mm`}>
          <Slider value={t.marginV ?? 48} min={20} max={80} step={2} onChange={v => up({ marginV: v })} />
        </Row>

        <Row label="Space Between Entries" right={`${t.entrySpacing ?? 11}px`}>
          <Slider value={t.entrySpacing ?? 11} min={2} max={30} step={1} onChange={v => up({ entrySpacing: v })} />
        </Row>
      </div>

      {/* ── Section Headings ─────────────────────────────────────────────── */}
      <div className={SECTION}>
        <p className={HEAD}>Section Headings</p>

        {/* Style grid */}
        <div className="mb-4">
          <p className="text-xs text-slate-500 mb-2">Style</p>
          <div className="grid grid-cols-4 gap-1.5">
            {HEADING_STYLES.map(({ id, label, render }) => {
              const active = (t.headingStyle ?? 'underline') === id;
              return (
                <button
                  key={id}
                  onClick={() => up({ headingStyle: id })}
                  title={label}
                  className={`h-12 rounded-lg border-2 overflow-hidden transition-all ${
                    active ? 'border-violet-500 shadow-sm' : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  {render(accent)}
                </button>
              );
            })}
          </div>
        </div>

        {/* Case */}
        <div className="mb-4">
          <p className="text-xs text-slate-500 mb-2">Capitalization</p>
          <div className="flex gap-1.5">
            {([['normal', 'Aa Normal'], ['capitalize', 'Aa Capitalize'], ['uppercase', 'AA UPPERCASE']] as const).map(([val, lbl]) => (
              <button
                key={val}
                onClick={() => up({ headingCase: val })}
                className={`flex-1 py-1.5 rounded-lg text-xs border-2 transition-all ${
                  (t.headingCase ?? 'uppercase') === val
                    ? 'bg-violet-600 text-white border-violet-600'
                    : 'bg-white text-slate-600 border-slate-200 hover:border-violet-300'
                }`}
              >
                {lbl}
              </button>
            ))}
          </div>
        </div>

        {/* Size */}
        <div className="mb-4">
          <p className="text-xs text-slate-500 mb-2">Size</p>
          <div className="flex gap-1.5">
            {(['xs', 's', 'm', 'l'] as const).map(sz => (
              <button
                key={sz}
                onClick={() => up({ headingSize: sz })}
                className={`flex-1 py-1.5 rounded-lg border-2 transition-all uppercase text-xs font-bold ${
                  (t.headingSize ?? 's') === sz
                    ? 'bg-violet-600 text-white border-violet-600'
                    : 'bg-white text-slate-600 border-slate-200 hover:border-violet-300'
                }`}
              >
                {sz}
              </button>
            ))}
          </div>
        </div>

        {/* Alignment */}
        <div>
          <p className="text-xs text-slate-500 mb-2">Alignment</p>
          <div className="flex gap-1.5">
            {(['left', 'center'] as const).map(align => (
              <button
                key={align}
                onClick={() => up({ headingAlign: align })}
                className={`flex-1 py-1.5 rounded-lg border-2 text-xs font-semibold capitalize transition-all ${
                  (t.headingAlign ?? 'left') === align
                    ? 'bg-violet-600 text-white border-violet-600'
                    : 'bg-white text-slate-600 border-slate-200 hover:border-violet-300'
                }`}
              >
                {align}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Page Size ────────────────────────────────────────────────────── */}
      <div className={SECTION}>
        <p className={HEAD}>Page Size</p>
        <div className="flex gap-2">
          {(['a4', 'letter'] as const).map(size => (
            <button
              key={size}
              onClick={() => up({ pageSize: size })}
              className={`flex-1 py-2 rounded-xl text-xs font-semibold border-2 transition-all ${
                (t.pageSize ?? 'a4') === size
                  ? 'bg-violet-600 text-white border-violet-600'
                  : 'bg-white text-slate-600 border-slate-200 hover:border-violet-300'
              }`}
            >
              {size === 'a4' ? 'A4 (210×297mm)' : 'US Letter (8.5×11in)'}
            </button>
          ))}
        </div>
      </div>

    </div>
  );
}
