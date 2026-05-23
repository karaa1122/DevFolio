import React from 'react';
import type { Resume } from '@devfolio/shared';
import { getOrderedResumeSections } from '@devfolio/shared';
import { buildResumeCss, buildResumeFontLink } from './print.css';
import { resumeTemplateRegistry } from './templates/registry';

interface Props {
  resume: Resume;
  /**
   * `screen` — for the editor canvas (paper shadow, gaps between pages).
   * `print` — bare for Playwright PDF rendering.
   */
  mode?: 'screen' | 'print';
  /**
   * Optional pre-computed page slices (one array of sections per page) from the
   * editor's measurement-based paginator. When omitted, all sections render on a
   * single page — Chromium's print engine handles real pagination via @page +
   * break-inside rules.
   */
  pages?: ReadonlyArray<ReadonlyArray<string>>;
}

export function ResumeRenderer({ resume, mode = 'screen', pages }: Props) {
  const Template = resumeTemplateRegistry[resume.template] ?? resumeTemplateRegistry.classic;
  const ordered = getOrderedResumeSections(resume).filter((s) => s.visible);

  const css = buildResumeCss(resume, { forScreen: mode === 'screen' });
  const fontHref = buildResumeFontLink(resume);

  const pageSlices: ReadonlyArray<ReadonlyArray<string>> = pages?.length
    ? pages
    : [ordered.map((s) => s.id)];

  const byId = new Map(ordered.map((s) => [s.id, s]));

  return (
    <div className="resume-doc" data-resume-id={resume.id}>
      <link rel="stylesheet" href={fontHref} />
      <style dangerouslySetInnerHTML={{ __html: css }} />

      {pageSlices.map((ids, pageIdx) => {
        const sectionsForPage = ids
          .map((id) => byId.get(id))
          .filter((s): s is NonNullable<typeof s> => s !== undefined);
        return (
          <div key={pageIdx} className="resume-page" data-page-index={pageIdx + 1}>
            <Template resume={resume} sections={sectionsForPage} />
          </div>
        );
      })}
    </div>
  );
}
