'use client';

import { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { usePortfolio } from '@/hooks/usePortfolio';
import { useEditorStore } from '@/store/editor.store';
import { Editor } from '@/components/editor/Editor';

export default function EditorPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const { portfolio, isLoading, error, mutate } = usePortfolio(id);
  const setPortfolio = useEditorStore((s) => s.setPortfolio);

  useEffect(() => {
    if (portfolio) setPortfolio(portfolio.data);
  }, [portfolio, setPortfolio]);

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-slate-950">
        <div className="text-slate-400 animate-pulse">Loading editor...</div>
      </div>
    );
  }

  if (error || !portfolio) {
    return (
      <div className="h-screen flex items-center justify-center bg-slate-950">
        <div className="text-center">
          <p className="text-slate-400 mb-4">Portfolio not found</p>
          <button
            onClick={() => router.push('/dashboard')}
            className="text-violet-400 hover:text-violet-300 text-sm"
          >
            ← Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return <Editor portfolioId={id} isPublished={portfolio.isPublished} onPublishChange={mutate} />;
}
