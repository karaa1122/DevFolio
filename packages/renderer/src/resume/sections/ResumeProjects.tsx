import React from 'react';
import type { ResumeProjectsSection } from '@devfolio/shared';
import { formatDateRange } from '../format';
import { renderResumeContent } from '../rich-text';

interface Props {
  section: ResumeProjectsSection;
}

export function ResumeProjects({ section }: Props) {
  const { heading, items } = section.data;
  if (!items.length) return null;
  return (
    <section className="resume-section">
      <h2 className="resume-section-heading">{heading}</h2>
      {items.map((item) => {
        const dateRange =
          item.year != null
            ? String(item.year)
            : formatDateRange(item.startDate ?? '', item.endDate, false);
        return (
          <div key={item.id} className="resume-item">
            <div className="resume-item-head">
              <div>
                <span className="resume-item-title">{item.name}</span>
                {item.url && (
                  <a href={item.url} className="resume-item-link" style={projLinkStyle('accent')}>
                    {' '}↗ live
                  </a>
                )}
                {item.repoUrl && (
                  <a href={item.repoUrl} className="resume-item-link" style={projLinkStyle('muted')}>
                    {' '}↗ code
                  </a>
                )}
              </div>
              {dateRange && <span className="resume-item-meta">{dateRange}</span>}
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
            {item.technologies.length > 0 && (
              <div className="resume-tech-row">
                {item.technologies.map((t) => (
                  <span key={t}>{t}</span>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </section>
  );
}

function projLinkStyle(kind: 'accent' | 'muted'): React.CSSProperties {
  return {
    color: kind === 'accent' ? 'var(--resume-color-accent)' : 'var(--resume-color-muted)',
    fontSize: 'var(--resume-size-meta)',
    marginLeft: '1mm',
    fontWeight: 500,
  };
}
