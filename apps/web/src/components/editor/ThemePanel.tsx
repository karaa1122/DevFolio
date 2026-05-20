'use client';

import { useEditorStore } from '@/store/editor.store';
import useSWR from 'swr';
import { themesApi } from '@/lib/api';
import type { Theme, ThemePreset } from '@devfolio/shared';

export function ThemePanel() {
  const portfolio = useEditorStore((s) => s.portfolio);
  const updateTheme = useEditorStore((s) => s.updateTheme);
  const { data: presets } = useSWR<ThemePreset[]>('/themes', () => themesApi.list());

  if (!portfolio) return null;
  const { theme } = portfolio;

  return (
    <div className="p-4 space-y-5">
      <h3 className="text-sm font-semibold text-slate-300">Theme</h3>

      {/* Presets */}
      {presets && presets.length > 0 && (
        <div>
          <label className="block text-xs text-slate-500 mb-2">Presets</label>
          <div className="grid grid-cols-2 gap-2">
            {presets.map((preset) => (
              <button
                key={preset.id}
                onClick={() => updateTheme(preset.theme)}
                className="flex items-center gap-2 p-2.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 hover:border-violet-600 rounded-lg text-left transition-colors"
              >
                <span
                  className="w-4 h-4 rounded-full shrink-0"
                  style={{ backgroundColor: preset.preview }}
                />
                <span className="text-xs text-slate-300">{preset.name}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Font */}
      <div>
        <label className="block text-xs text-slate-500 mb-1.5">Font</label>
        <select
          value={theme.font}
          onChange={(e) => updateTheme({ font: e.target.value as Theme['font'] })}
          className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-violet-500"
        >
          <option value="inter">Inter</option>
          <option value="roboto">Roboto</option>
          <option value="poppins">Poppins</option>
          <option value="fira-code">Fira Code</option>
          <option value="jetbrains-mono">JetBrains Mono</option>
        </select>
      </div>

      {/* Radius */}
      <div>
        <label className="block text-xs text-slate-500 mb-1.5">Border Radius</label>
        <div className="flex gap-1.5">
          {(['none', 'sm', 'md', 'lg', 'full'] as const).map((r) => (
            <button
              key={r}
              onClick={() => updateTheme({ radius: r })}
              className={`flex-1 py-2 text-xs rounded-lg border transition-colors ${
                theme.radius === r
                  ? 'bg-violet-900/50 border-violet-600 text-violet-300'
                  : 'bg-slate-800 border-slate-700 text-slate-500 hover:text-slate-300'
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      {/* Spacing */}
      <div>
        <label className="block text-xs text-slate-500 mb-1.5">Spacing</label>
        <div className="flex gap-1.5">
          {(['compact', 'normal', 'relaxed'] as const).map((s) => (
            <button
              key={s}
              onClick={() => updateTheme({ spacing: s })}
              className={`flex-1 py-2 text-xs rounded-lg border transition-colors ${
                theme.spacing === s
                  ? 'bg-violet-900/50 border-violet-600 text-violet-300'
                  : 'bg-slate-800 border-slate-700 text-slate-500 hover:text-slate-300'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Colors */}
      <div>
        <label className="block text-xs text-slate-500 mb-2">Colors</label>
        <div className="space-y-2.5">
          {(
            [
              { key: 'primary', label: 'Primary' },
              { key: 'background', label: 'Background' },
              { key: 'foreground', label: 'Text' },
              { key: 'accent', label: 'Accent' },
            ] as const
          ).map(({ key, label }) => (
            <div key={key} className="flex items-center justify-between">
              <span className="text-xs text-slate-400">{label}</span>
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-500 font-mono">{theme.colors[key]}</span>
                <input
                  type="color"
                  value={theme.colors[key]}
                  onChange={(e) =>
                    updateTheme({ colors: { ...theme.colors, [key]: e.target.value } })
                  }
                  className="w-8 h-8 rounded cursor-pointer border border-slate-600 bg-transparent p-0.5"
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
