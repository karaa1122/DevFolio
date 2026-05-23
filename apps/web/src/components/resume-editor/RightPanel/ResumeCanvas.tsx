'use client';

import { useEffect, useRef } from 'react';
import { useResumeStore } from '@/store/resume.store';
import { ResumeRenderer } from '@devfolio/renderer';
import { usePagination } from './usePagination';
import { EmptyCanvas } from './EmptyCanvas';

export function ResumeCanvas() {
  const resume = useResumeStore((s) => s.resume);
  const zoom = useResumeStore((s) => s.zoom);
  const selectedSectionId = useResumeStore((s) => s.selectedSectionId);
  const selectSection = useResumeStore((s) => s.selectSection);
  const setPageCount = useResumeStore((s) => s.setPageCount);
  const containerRef = useRef<HTMLDivElement>(null);

  const sectionIds = resume?.layout.sectionsOrder ?? [];
  const headerSection = resume?.sections.find((s) => s.type === 'header');
  const nonHeaderIds = sectionIds.filter((id) => id !== headerSection?.id);

  const measuredPages = usePagination(containerRef, {
    format: resume?.page.format ?? 'A4',
    margin: resume?.page.margin ?? 'normal',
    sectionIds: nonHeaderIds,
  });

  // Fallback: if measuredPages is stale (missing any current ids — happens
  // immediately after adding a section, before the MutationObserver fires),
  // dump everything onto a single page so the new section renders right away.
  // The next measurement tick will re-balance into real pages.
  const measuredIds = new Set(measuredPages.flat());
  const pagesAreFresh = nonHeaderIds.every((id) => measuredIds.has(id));
  const pages: string[][] = pagesAreFresh ? measuredPages : [nonHeaderIds];

  useEffect(() => {
    setPageCount(pages.length);
  }, [pages.length, setPageCount]);

  useEffect(() => {
    const node = containerRef.current;
    if (!node) return;
    node.querySelectorAll('[data-selected="true"]').forEach((el) => {
      (el as HTMLElement).removeAttribute('data-selected');
    });
    if (selectedSectionId) {
      const el = node.querySelector(`[data-section-id="${selectedSectionId}"]`) as HTMLElement | null;
      el?.setAttribute('data-selected', 'true');
    }
  }, [selectedSectionId, resume]);

  if (!resume) return null;

  const empty = resume.sections.length === 0;

  const pagesWithHeader: string[][] = pages.map((p, i) =>
    i === 0 && headerSection ? [headerSection.id, ...p] : p,
  );

  const handleClick = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    const sectionEl = target.closest('[data-section-id]') as HTMLElement | null;
    if (sectionEl?.dataset.sectionId) {
      selectSection(sectionEl.dataset.sectionId);
    }
  };

  return (
    <div className="flex-1 overflow-auto resume-canvas-bg">
      <style>{`
        .resume-canvas-bg {
          background-color: #f1f5f9;
          background-image:
            radial-gradient(circle at 1px 1px, rgba(15, 23, 42, 0.05) 1px, transparent 0);
          background-size: 22px 22px;
        }
        :is(.dark) .resume-canvas-bg,
        html.dark .resume-canvas-bg {
          background-color: #0b1120;
          background-image:
            radial-gradient(circle at 1px 1px, rgba(148, 163, 184, 0.07) 1px, transparent 0);
        }
        /* Dark by default in this editor */
        .resume-canvas-bg {
          background-color: #0b1120;
          background-image:
            radial-gradient(circle at 1px 1px, rgba(148, 163, 184, 0.07) 1px, transparent 0);
        }
        [data-section-id] {
          cursor: pointer;
          transition: outline-color 140ms ease-out, box-shadow 140ms ease-out;
          outline: 1.5px solid transparent;
          outline-offset: 3px;
          border-radius: 1mm;
        }
        [data-section-id]:hover {
          outline-color: rgba(167, 139, 250, 0.3);
        }
        [data-section-id][data-selected="true"] {
          outline-color: rgba(167, 139, 250, 0.7);
          box-shadow: 0 0 0 4px rgba(167, 139, 250, 0.08);
        }
      `}</style>
      <div className="min-h-full w-full flex justify-center py-12">
        {empty ? (
          <EmptyCanvas />
        ) : (
          <div
            ref={containerRef}
            onClick={handleClick}
            style={{
              transform: `scale(${zoom})`,
              transformOrigin: 'top center',
              transition: 'transform 160ms ease-out',
            }}
            data-selected-section={selectedSectionId ?? ''}
          >
            <ResumeRenderer resume={resume} mode="screen" pages={pagesWithHeader} />
          </div>
        )}
      </div>
    </div>
  );
}
