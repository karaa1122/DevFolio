'use client';

import { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useResume } from '@/hooks/useResume';
import { useResumeStore } from '@/store/resume.store';
import { ResumeEditor } from '@/components/resume-editor/ResumeEditor';

export default function ResumeEditorPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const { resume, isLoading, error } = useResume(id);
  const setResume = useResumeStore((s) => s.setResume);

  useEffect(() => {
    if (resume) setResume(resume.data);
  }, [resume, setResume]);

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-slate-950">
        <div className="text-slate-400 animate-pulse">Loading editor...</div>
      </div>
    );
  }

  if (error || !resume) {
    return (
      <div className="h-screen flex items-center justify-center bg-slate-950">
        <div className="text-center">
          <p className="text-slate-400 mb-4">Resume not found</p>
          <button
            onClick={() => router.push('/resume')}
            className="text-violet-400 hover:text-violet-300 text-sm"
          >
            ← Back to resumes
          </button>
        </div>
      </div>
    );
  }

  return <ResumeEditor resumeId={id} />;
}
