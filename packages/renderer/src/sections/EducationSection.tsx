import React from 'react';
import type { EducationSection, Theme } from '@devfolio/shared';
import { SectionHeader, sectionPadding, radiusMap, MONO } from './_shared';

interface Props {
  section: EducationSection;
  theme: Theme;
}

export function EducationSection({ section, theme }: Props) {
  const { data } = section;
  const { colors } = theme;
  const radius = radiusMap[theme.radius] ?? '16px';

  return (
    <section
      id={section.id}
      style={{ backgroundColor: colors.card, color: colors.foreground, padding: sectionPadding(theme) }}
    >
      <div style={{ maxWidth: '880px', margin: '0 auto' }}>
        <SectionHeader kicker="Education" heading={data.heading} theme={theme} />

        <div style={{ display: 'grid', gap: '1.1rem' }}>
          {data.items.map((item) => (
            <div
              key={item.id}
              className="pf-reveal pf-card"
              style={{
                backgroundColor: colors.background,
                border: `1px solid ${colors.border}`,
                borderRadius: radius,
                padding: '1.6rem',
                display: 'flex',
                gap: '1.25rem',
                alignItems: 'flex-start',
              }}
            >
              <div
                style={{
                  width: '3rem',
                  height: '3rem',
                  flexShrink: 0,
                  borderRadius: '12px',
                  display: 'grid',
                  placeItems: 'center',
                  overflow: 'hidden',
                  background: item.logo ? 'transparent' : `linear-gradient(135deg, ${colors.primary}, ${colors.accent})`,
                  color: colors.background,
                  fontWeight: 700,
                }}
              >
                {item.logo ? (
                  <img src={item.logo} alt={item.institution} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                ) : (
                  (item.institution || '?')[0].toUpperCase()
                )}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.5rem' }}>
                  <div>
                    <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: colors.foreground, margin: 0, letterSpacing: '-0.01em' }}>
                      {item.degree}
                      {item.field ? ` in ${item.field}` : ''}
                    </h3>
                    <p style={{ color: colors.primary, fontWeight: 600, margin: '0.25rem 0', fontSize: '0.92rem' }}>
                      {item.institution}
                    </p>
                  </div>
                  <span style={{ fontFamily: MONO, color: colors.muted, fontSize: '0.78rem', whiteSpace: 'nowrap' }}>
                    {item.startDate} — {item.current ? 'Present' : (item.endDate ?? '')}
                  </span>
                </div>
                {item.gpa && (
                  <p style={{ color: colors.muted, fontSize: '0.85rem', marginTop: '0.3rem' }}>GPA: {item.gpa}</p>
                )}
                {item.description && (
                  <p style={{ color: colors.muted, fontSize: '0.9rem', lineHeight: 1.65, marginTop: '0.55rem' }}>
                    {item.description}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
