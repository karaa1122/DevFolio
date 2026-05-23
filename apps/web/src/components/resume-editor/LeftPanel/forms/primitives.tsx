'use client';

import type { ReactNode } from 'react';
import { RichEditField } from '../../rich-edit/RichEditField';
import { RichEditor } from '../../rich-edit/RichEditor';

export function Field({
  label,
  hint,
  children,
}: {
  label?: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <div className="space-y-1">
      {label && (
        <label className="block text-[11px] uppercase tracking-wider text-slate-500 font-semibold">
          {label}
        </label>
      )}
      {children}
      {hint && <p className="text-[11px] text-slate-600">{hint}</p>}
    </div>
  );
}

export function TextInput({
  value,
  onChange,
  placeholder,
  type = 'text',
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
}) {
  return (
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full bg-slate-800/70 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-violet-500 placeholder:text-slate-600"
    />
  );
}

export function TextArea({
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
      rows={rows}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full bg-slate-800/70 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-violet-500 placeholder:text-slate-600 resize-none"
    />
  );
}

// (Rich text editing is handled by RichEditField / RichEditor — Tiptap-backed.)

export function Toggle({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
}) {
  return (
    <label className="flex items-center gap-2 text-sm text-slate-300 cursor-pointer select-none">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="accent-violet-500"
      />
      {label}
    </label>
  );
}

export function ChipInput({
  values,
  onChange,
  placeholder,
}: {
  values: string[];
  onChange: (next: string[]) => void;
  placeholder?: string;
}) {
  const handleKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const target = e.currentTarget;
    if (e.key === 'Enter' || e.key === ',') {
      const raw = target.value.trim().replace(/,$/, '');
      if (raw) {
        e.preventDefault();
        onChange([...values, raw]);
        target.value = '';
      }
    } else if (e.key === 'Backspace' && target.value === '' && values.length) {
      onChange(values.slice(0, -1));
    }
  };

  return (
    <div className="bg-slate-800/70 border border-slate-700 rounded-lg px-2 py-1.5 flex flex-wrap items-center gap-1.5 focus-within:border-violet-500 transition-colors">
      {values.map((v, i) => (
        <span
          key={`${v}-${i}`}
          className="flex items-center gap-1 bg-slate-700/80 text-slate-200 text-xs px-2 py-0.5 rounded-md"
        >
          {v}
          <button
            type="button"
            onClick={() => onChange(values.filter((_, j) => j !== i))}
            className="text-slate-400 hover:text-red-400"
            aria-label={`Remove ${v}`}
          >
            ×
          </button>
        </span>
      ))}
      <input
        type="text"
        onKeyDown={handleKey}
        placeholder={placeholder ?? 'Add and press Enter'}
        className="flex-1 min-w-[80px] bg-transparent text-sm text-slate-100 px-1 py-0.5 focus:outline-none placeholder:text-slate-600"
      />
    </div>
  );
}

export function BulletList({
  bullets,
  onChange,
  placeholder = 'Achievement bullet point',
}: {
  bullets: string[];
  onChange: (next: string[]) => void;
  placeholder?: string;
}) {
  const update = (i: number, value: string) => {
    const next = [...bullets];
    next[i] = value;
    onChange(next);
  };
  const remove = (i: number) => onChange(bullets.filter((_, j) => j !== i));
  const add = () => onChange([...bullets, '']);

  return (
    <div className="space-y-1.5">
      {bullets.map((b, i) => (
        <div key={i} className="flex items-start gap-1.5 group">
          <span className="text-slate-600 mt-3 text-xs select-none">·</span>
          <div className="flex-1 rounded-md border border-slate-700 bg-slate-800/70 focus-within:border-violet-500 transition-colors overflow-hidden">
            <RichEditor
              value={b}
              onChange={(v) => update(i, v)}
              placeholder={placeholder}
              block={false}
              minHeight={28}
            />
          </div>
          <button
            type="button"
            onClick={() => remove(i)}
            className="opacity-0 group-hover:opacity-100 text-slate-500 hover:text-red-400 text-xs mt-2 transition-opacity"
            title="Remove bullet"
          >
            ✕
          </button>
        </div>
      ))}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={add}
          className="text-xs text-slate-400 hover:text-slate-100 hover:bg-slate-800/70 px-2 py-1 rounded transition-colors"
        >
          + Add bullet
        </button>
        <span className="text-[10px] text-slate-600 select-none">
          B · I · U · link
        </span>
      </div>
    </div>
  );
}

// Re-export so forms can import every primitive from this one file.
export { RichEditField };

export function ItemCard({
  title,
  subtitle,
  onRemove,
  children,
  defaultOpen = true,
}: {
  title: string;
  subtitle?: string;
  onRemove?: () => void;
  children: ReactNode;
  defaultOpen?: boolean;
}) {
  // Note: details element handles open/close natively, no React state needed.
  return (
    <details
      open={defaultOpen}
      className="group rounded-lg border border-slate-800 bg-slate-900/40 open:bg-slate-900/70 transition-colors"
    >
      <summary className="flex items-center gap-2 px-3 py-2.5 cursor-pointer select-none list-none">
        <span className="text-slate-500 text-xs transition-transform group-open:rotate-90">▸</span>
        <div className="flex-1 min-w-0">
          <div className="text-sm text-slate-100 truncate">{title || 'Untitled'}</div>
          {subtitle && (
            <div className="text-[11px] text-slate-500 truncate">{subtitle}</div>
          )}
        </div>
        {onRemove && (
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              if (window.confirm('Remove this item?')) onRemove();
            }}
            className="text-slate-500 hover:text-red-400 text-xs w-5 h-5 rounded grid place-items-center"
            title="Remove"
          >
            ✕
          </button>
        )}
      </summary>
      <div className="px-3 pb-3 pt-1 space-y-3">{children}</div>
    </details>
  );
}

export function AddButton({
  onClick,
  label,
}: {
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full text-sm text-slate-400 hover:text-slate-100 hover:bg-slate-800/70 border border-dashed border-slate-800 hover:border-slate-700 rounded-lg py-2.5 transition-colors"
    >
      + {label}
    </button>
  );
}

export function TwoCol({ children }: { children: ReactNode }) {
  return <div className="grid grid-cols-2 gap-3">{children}</div>;
}
