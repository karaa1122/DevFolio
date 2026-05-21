'use client';

import { useResumeStore } from '@/store/resume.store';

const inputCls = 'w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-violet-500';
const labelCls = 'block text-xs text-slate-400 mb-1';

export function ResumeThemePanel() {
  const { resume, updateTheme } = useResumeStore();
  if (!resume) return null;

  const { theme } = resume;

  return (
    <div className="p-4 space-y-5">
      <div>
        <label className={labelCls}>Template</label>
        <select
          className={inputCls}
          value={theme.template ?? 'classic'}
          onChange={(e) => updateTheme({ template: e.target.value as 'classic' | 'modern' | 'minimal' })}
        >
          <option value="classic">Classic</option>
          <option value="modern">Modern</option>
          <option value="minimal">Minimal</option>
        </select>
      </div>

      <div>
        <label className={labelCls}>Accent Color</label>
        <div className="flex items-center gap-2">
          <input
            type="color"
            value={theme.accent ?? '#2563eb'}
            onChange={(e) => updateTheme({ accent: e.target.value })}
            className="w-10 h-10 rounded cursor-pointer bg-transparent border-0"
          />
          <input
            className={inputCls}
            value={theme.accent ?? '#2563eb'}
            onChange={(e) => updateTheme({ accent: e.target.value })}
            placeholder="#2563eb"
          />
        </div>
      </div>

      <div>
        <label className={labelCls}>Font</label>
        <select
          className={inputCls}
          value={theme.font ?? 'inter'}
          onChange={(e) => updateTheme({ font: e.target.value as 'inter' | 'georgia' | 'roboto' })}
        >
          <option value="inter">Inter (Sans-serif)</option>
          <option value="georgia">Georgia (Serif)</option>
          <option value="roboto">Roboto (Sans-serif)</option>
        </select>
      </div>

      <div>
        <label className={labelCls}>Font Size</label>
        <select
          className={inputCls}
          value={theme.fontSize ?? 'normal'}
          onChange={(e) => updateTheme({ fontSize: e.target.value as 'compact' | 'normal' | 'comfortable' })}
        >
          <option value="compact">Compact</option>
          <option value="normal">Normal</option>
          <option value="comfortable">Comfortable</option>
        </select>
      </div>

      <div>
        <label className={labelCls}>Page Size</label>
        <select
          className={inputCls}
          value={theme.pageSize ?? 'a4'}
          onChange={(e) => updateTheme({ pageSize: e.target.value as 'a4' | 'letter' })}
        >
          <option value="a4">A4</option>
          <option value="letter">US Letter</option>
        </select>
      </div>
    </div>
  );
}
