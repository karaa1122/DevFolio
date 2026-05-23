import React from 'react';
import type { ResumeCertificationsSection } from '@devfolio/shared';
import { formatDate } from '../format';

interface Props {
  section: ResumeCertificationsSection;
}

export function ResumeCertifications({ section }: Props) {
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
            {(item.date || item.expiryDate) && (
              <span className="resume-item-meta">
                {formatDate(item.date)}
                {item.expiryDate ? ` (exp. ${formatDate(item.expiryDate)})` : ''}
              </span>
            )}
          </div>
          {item.credentialId && (
            <div className="resume-item-sub" style={{ marginTop: '0.5mm' }}>
              ID: {item.credentialId}
            </div>
          )}
        </div>
      ))}
    </section>
  );
}
