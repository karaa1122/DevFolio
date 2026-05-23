import React from 'react';
import type { ResumeSummarySection } from '@devfolio/shared';
import { renderResumeContent } from '../rich-text';

interface Props {
  section: ResumeSummarySection;
}

export function ResumeSummary({ section }: Props) {
  const { heading, body } = section.data;
  if (!body.trim()) return null;
  return (
    <section className="resume-section">
      <h2 className="resume-section-heading">{heading}</h2>
      <div className="resume-summary-body resume-rich">
        {renderResumeContent(body, { as: 'fragment' })}
      </div>
    </section>
  );
}
