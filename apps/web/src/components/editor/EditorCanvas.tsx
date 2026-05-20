'use client';

import { useEditorStore } from '@/store/editor.store';
import { PortfolioRenderer } from '@devfolio/renderer';

interface Props {
  mode: 'edit' | 'preview';
}

export function EditorCanvas({ mode }: Props) {
  const portfolio = useEditorStore((s) => s.portfolio);
  const selectSection = useEditorStore((s) => s.selectSection);

  if (!portfolio) return null;

  if (mode === 'preview') {
    return (
      <div className="flex-1 overflow-auto bg-white">
        <PortfolioRenderer portfolio={portfolio} />
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-auto bg-slate-950 p-6" onClick={() => selectSection(null)}>
      <div
        className="min-h-full mx-auto bg-white rounded-xl overflow-hidden shadow-2xl"
        style={{ maxWidth: '900px' }}
      >
        <PortfolioRenderer portfolio={portfolio} />
      </div>
    </div>
  );
}
