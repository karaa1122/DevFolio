import React from 'react';
import type { ResumeAwardsSection } from '@devfolio/shared';
import { formatDate } from '../format';
import { renderResumeContent } from '../rich-text';

interface Props {
  section: ResumeAwardsSection;
}

export function ResumeAwards({ section }: Props) {
  const { heading, items } = section.data;
  if (!items.length) return null;
  return (
    <section className="resume-section">
      <h2 className="resume-section-heading">{heading}</h2>
      {items.map((item) => (
        <div key={item.id} className="resume-item">
          <div className="resume-item-head">
            <div>
              <span className="resume-item-title">{item.name}</span>
              {item.issuer && <span className="resume-item-sub"> — {item.issuer}</span>}
            </div>
            {item.date && <span className="resume-item-meta">{formatDate(item.date)}</span>}
          </div>
          {item.description && (
            <div className="resume-item-summary resume-rich">
              {renderResumeContent(item.description, { as: 'fragment' })}
            </div>
          )}
        </div>
      ))}
    </section>
  );
}
