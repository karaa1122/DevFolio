'use client';

import Link from 'next/link';
import { useEditorStore } from '@/store/editor.store';
import { TemplatePreview } from '@/components/templates/TemplatePreview';
import { PORTFOLIO_TEMPLATES } from '@devfolio/shared';
import { IconExternal } from '@/components/icons';

export function TemplatePanel() {
  const portfolio = useEditorStore((s) => s.portfolio);
  const updateTemplate = useEditorStore((s) => s.updateTemplate);
  const updateTheme = useEditorStore((s) => s.updateTheme);

  if (!portfolio) return null;
  const current = portfolio.template ?? 'aurora';

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-content">Template</h3>
        <Link
          href="/templates"
          target="_blank"
          className="inline-flex items-center gap-1 text-xs text-content-faint transition-colors hover:text-accent"
        >
          Marketplace
          <IconExternal className="h-3 w-3" />
        </Link>
      </div>
      <p className="text-xs text-content-faint leading-relaxed">
        Switching templates changes the layout chrome and typography — your content and theme
        colors stay as they are.
      </p>

      <div className="space-y-3">
        {PORTFOLIO_TEMPLATES.map((meta) => {
          const active = meta.id === current;
          return (
            <div
              key={meta.id}
              className={`overflow-hidden rounded-xl border transition-colors ${
                active ? 'border-accent bg-accent/5' : 'border-line bg-surface-2 hover:border-accent/40'
              }`}
            >
              <button
                onClick={() => updateTemplate(meta.id)}
                className="block w-full text-left"
              >
                <TemplatePreview meta={meta} className="w-full text-[9px]" />
                <div className="flex items-center justify-between px-3 py-2.5 border-t border-line">
                  <div>
                    <p className="text-xs font-semibold text-content">{meta.name}</p>
                    <p className="text-[11px] text-content-faint">{meta.tagline}</p>
                  </div>
                  {active && (
                    <span className="rounded-full bg-accent/15 px-2 py-0.5 text-[10px] font-medium text-accent">
                      Active
                    </span>
                  )}
                </div>
              </button>
              {active && (
                <div className="border-t border-line px-3 py-2.5">
                  <button
                    onClick={() => updateTheme(meta.suggestedTheme)}
                    className="w-full rounded-lg border border-line bg-surface py-2 text-[11px] font-medium text-content-muted transition-colors hover:border-accent/50 hover:text-accent"
                  >
                    Apply suggested theme
                  </button>
                  <p className="mt-1.5 text-[10px] leading-snug text-content-faint">
                    Replaces your colors and fonts with this template&apos;s recommended look.
                  </p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
