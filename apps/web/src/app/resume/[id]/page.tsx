'use client';

import { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import useSWR from 'swr';
import { resumeApi } from '@/lib/api';
import { useResumeStore } from '@/store/resume.store';
import { ResumeEditor } from '@/components/resume-editor/ResumeEditor';

export default function ResumeEditorPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const { data: record, isLoading, error } = useSWR(
    id ? `resume:${id}` : null,
    () => resumeApi.getById(id),
  );

  const setResume = useResumeStore((s) => s.setResume);

  useEffect(() => {
    if (record) setResume(record.data);
  }, [record, setResume]);

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-slate-950">
        <div className="text-slate-400 animate-pulse">Loading resume...</div>
      </div>
    );
  }

  if (error || !record) {
    return (
      <div className="h-screen flex items-center justify-center bg-slate-950">
        <div className="text-center">
          <p className="text-slate-400 mb-4">Resume not found</p>
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

  return <ResumeEditor resumeId={id} />;
}
