import React from 'react';
import type { ResumeExperienceSection } from '@devfolio/shared';
import { formatDateRange } from '../format';
import { renderResumeContent } from '../rich-text';

interface Props {
  section: ResumeExperienceSection;
}

export function ResumeExperience({ section }: Props) {
  const { heading, items } = section.data;
  if (!items.length) return null;

  return (
    <section className="resume-section">
      <h2 className="resume-section-heading">{heading}</h2>
      {items.map((item) => (
        <div key={item.id} className="resume-item">
          <div className="resume-item-head">
            <div>
              <span className="resume-item-title">{item.role}</span>
              {item.company && (
                <>
                  <span className="resume-item-sub"> · </span>
                  <span className="resume-item-sub-strong">{item.company}</span>
                </>
              )}
              {item.location && <span className="resume-item-sub">, {item.location}</span>}
            </div>
            <span className="resume-item-meta">
              {formatDateRange(item.startDate, item.endDate, item.current)}
            </span>
          </div>
          {item.summary && (
            <div className="resume-item-summary resume-rich">
              {renderResumeContent(item.summary, { as: 'fragment' })}
            </div>
          )}
          {item.bullets.length > 0 && (
            <ul className="resume-item-bullets">
              {item.bullets.map((b, i) => (
                <li key={i}>{renderResumeContent(b, { as: 'fragment' })}</li>
              ))}
            </ul>
          )}
          {item.technologies.length > 0 && (
            <div className="resume-tech-row">
              {item.technologies.map((t) => (
                <span key={t}>{t}</span>
              ))}
            </div>
          )}
        </div>
      ))}
    </section>
  );
}
