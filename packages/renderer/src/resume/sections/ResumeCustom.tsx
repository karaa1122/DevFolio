import React from 'react';
import type { ResumeCustomSection } from '@devfolio/shared';
import { formatDate } from '../format';
import { renderResumeContent } from '../rich-text';

interface Props {
  section: ResumeCustomSection;
}

export function ResumeCustom({ section }: Props) {
  const { heading, items } = section.data;
  return (
    <section className="resume-section">
      <h2 className="resume-section-heading">{heading}</h2>
      {items.map((item) => (
        <div key={item.id} className="resume-item">
          <div className="resume-item-head">
            <div>
              <span className="resume-item-title">{item.title}</span>
              {item.subtitle && <span className="resume-item-sub"> — {item.subtitle}</span>}
              {item.location && <span className="resume-item-sub">, {item.location}</span>}
              {item.url && (
                <a
                  href={item.url}
                  style={{
                    marginLeft: '2mm',
                    color: 'var(--resume-color-accent)',
                    fontSize: 'var(--resume-size-meta)',
                  }}
                >
                  ↗
                </a>
              )}
            </div>
            {item.date && <span className="resume-item-meta">{formatDate(item.date)}</span>}
          </div>
          {item.description && (
            <div className="resume-item-summary resume-rich">
              {renderResumeContent(item.description, { as: 'fragment' })}
            </div>
          )}
          {item.bullets.length > 0 && (
            <ul className="resume-item-bullets">
              {item.bullets.map((b, i) => (
                <li key={i}>{renderResumeContent(b, { as: 'fragment' })}</li>
              ))}
            </ul>
          )}
        </div>
      ))}
    </section>
  );
}
