'use client';

import useSWR from 'swr';
import { resumeApi } from '@/lib/api';
import type { ResumeResponse } from '@devfolio/shared';

export function useResume(id: string | null) {
  const { data, error, isLoading, mutate } = useSWR<ResumeResponse>(
    id ? `/resumes/${id}` : null,
    () => resumeApi.getById(id as string),
    { revalidateOnFocus: false },
  );
  return { resume: data, error, isLoading, mutate };
}

export function useResumeList() {
  const { data, error, isLoading, mutate } = useSWR<ResumeResponse[]>(
    '/resumes/mine',
    resumeApi.list,
    { revalidateOnFocus: false },
  );
  return { resumes: data ?? [], error, isLoading, mutate };
}
