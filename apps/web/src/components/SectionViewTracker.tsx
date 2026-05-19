'use client';

import { useEffect, useRef } from 'react';
import { analyticsApi } from '@/lib/api';

interface Props {
  portfolioId: string;
  sectionIds: string[];
}

export function SectionViewTracker({ portfolioId, sectionIds }: Props) {
  const tracked = useRef(new Set<string>());

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          const sectionId = entry.target.id;
          if (sectionId && !tracked.current.has(sectionId)) {
            tracked.current.add(sectionId);
            analyticsApi.track({ portfolioId, type: 'section_view', sectionId }).catch(() => {});
          }
        }
      },
      { threshold: 0.3 },
    );

    for (const id of sectionIds) {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    }

    return () => observer.disconnect();
  }, [portfolioId, sectionIds]);

  return null;
}
