'use client';

import { useCallback, useState } from 'react';
import { aiApi } from '@/lib/api';
import { IconSparkle } from '@/components/icons';

type Action = 'improve' | 'grammar' | 'shorten';

const ACTIONS: { action: Action; label: string }[] = [
  { action: 'improve', label: 'Improve' },
  { action: 'grammar', label: 'Grammar' },
  { action: 'shorten', label: 'Shorter' },
];

/**
 * Improve / Grammar / Shorter for plain-text fields (portfolio Hero/About
 * bio) — the resume editor's rich-text fields get the same three actions via
 * `AiBar` in `resume-editor/rich-edit/RichEditor.tsx`. Both call the same
 * `POST /ai/rewrite` endpoint; this one just reads/writes a plain string
 * instead of Tiptap HTML.
 */
export function AiRewriteButtons({
  value,
  onChange,
}: {
  value: string;
  onChange: (next: string) => void;
}) {
  const [loading, setLoading] = useState<Action | null>(null);
  const [error, setError] = useState<string | null>(null);

  const run = useCallback(
    async (action: Action) => {
      if (!value.trim()) return;
      setError(null);
      setLoading(action);
      try {
        const { result } = await aiApi.rewrite(value, action, 'text');
        onChange(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'AI request failed');
      } finally {
        setLoading(null);
      }
    },
    [value, onChange],
  );

  return (
    <div className="mt-1.5">
      <div className="flex flex-wrap items-center gap-1.5">
        <IconSparkle className="h-3.5 w-3.5 text-accent shrink-0" />
        {ACTIONS.map(({ action, label }) => {
          const isActive = loading === action;
          return (
            <button
              key={action}
              type="button"
              disabled={!!loading || !value.trim()}
              onClick={() => run(action)}
              className={`h-6 px-2 rounded-md text-[11px] font-medium border transition-colors ${
                isActive
                  ? 'border-accent/50 bg-accent/15 text-accent cursor-wait'
                  : 'border-line bg-surface-2 text-content-muted hover:border-accent/40 hover:text-accent disabled:opacity-40 disabled:cursor-not-allowed'
              }`}
            >
              {isActive ? 'Working…' : label}
            </button>
          );
        })}
      </div>
      {error && (
        <div className="mt-1 flex items-center gap-2 text-[11px] text-red-400">
          <span>{error}</span>
          <button type="button" onClick={() => setError(null)} className="text-content-faint hover:text-content-muted">
            dismiss
          </button>
        </div>
      )}
    </div>
  );
}
