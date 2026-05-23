import React from 'react';
import type { ResumeEducationSection } from '@devfolio/shared';
import { formatDateRange } from '../format';
import { renderResumeContent } from '../rich-text';

interface Props {
  section: ResumeEducationSection;
}

export function ResumeEducation({ section }: Props) {
  const { heading, items } = section.data;
  if (!items.length) return null;
  return (
    <section className="resume-section">
      <h2 className="resume-section-heading">{heading}</h2>
      {items.map((item) => (
        <div key={item.id} className="resume-item">
          <div className="resume-item-head">
            <div>
              <span className="resume-item-title">{item.institution}</span>
              {item.location && <span className="resume-item-sub">, {item.location}</span>}
            </div>
            <span className="resume-item-meta">
              {formatDateRange(item.startDate, item.endDate, item.current)}
            </span>
          </div>
          <div className="resume-item-sub-strong">
            {item.degree}
            {item.field ? `, ${item.field}` : ''}
            {item.gpa ? ` · GPA ${item.gpa}` : ''}
          </div>
          {item.details.length > 0 && (
            <ul className="resume-item-bullets">
              {item.details.map((d, i) => (
                <li key={i}>{renderResumeContent(d, { as: 'fragment' })}</li>
              ))}
            </ul>
          )}
        </div>
      ))}
    </section>
  );
}
