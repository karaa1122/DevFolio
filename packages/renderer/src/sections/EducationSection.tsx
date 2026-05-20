import React from 'react';
import type { EducationSection, Theme } from '@devfolio/shared';

interface Props {
  section: EducationSection;
  theme: Theme;
}

const radiusMap: Record<string, string> = {
  none: '0',
  sm: '6px',
  md: '12px',
  lg: '20px',
  full: '24px',
};

export function EducationSection({ section, theme }: Props) {
  const { data } = section;
  const { colors } = theme;
  const padding =
    theme.spacing === 'compact'
      ? '3rem 2rem'
      : theme.spacing === 'relaxed'
        ? '6rem 2rem'
        : '5rem 2rem';
  const radius = radiusMap[theme.radius] ?? '12px';

  return (
    <section
      id={section.id}
      style={{ backgroundColor: colors.card, color: colors.foreground, padding }}
    >
      <div style={{ maxWidth: '900px', margin: '0 auto' }}>
        <h2
          style={{
            fontSize: 'clamp(1.75rem, 4vw, 2.5rem)',
            fontWeight: '700',
            textAlign: 'center',
            marginBottom: '1rem',
          }}
        >
          {data.heading}
        </h2>
        <div
          style={{
            width: '3rem',
            height: '4px',
            backgroundColor: colors.primary,
            margin: '0 auto 3rem',
            borderRadius: '2px',
          }}
        />

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {data.items.map((item) => (
            <div
              key={item.id}
              style={{
                backgroundColor: colors.background,
                border: `1px solid ${colors.border}`,
                borderRadius: radius,
                padding: '1.5rem',
                display: 'flex',
                gap: '1rem',
                alignItems: 'flex-start',
              }}
            >
              {item.logo && (
                <img
                  src={item.logo}
                  alt={item.institution}
                  style={{
                    width: '3rem',
                    height: '3rem',
                    borderRadius: '8px',
                    objectFit: 'contain',
                    flexShrink: 0,
                  }}
                />
              )}
              <div style={{ flex: 1 }}>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    flexWrap: 'wrap',
                    gap: '0.5rem',
                  }}
                >
                  <div>
                    <h3
                      style={{
                        fontSize: '1.1rem',
                        fontWeight: '700',
                        color: colors.foreground,
                        margin: 0,
                      }}
                    >
                      {item.degree}
                      {item.field ? ` in ${item.field}` : ''}
                    </h3>
                    <p
                      style={{
                        color: colors.primary,
                        fontWeight: '600',
                        margin: '0.25rem 0',
                        fontSize: '0.9rem',
                      }}
                    >
                      {item.institution}
                    </p>
                  </div>
                  <span style={{ color: colors.muted, fontSize: '0.85rem' }}>
                    {item.startDate} — {item.current ? 'Present' : (item.endDate ?? '')}
                  </span>
                </div>
                {item.gpa && (
                  <p style={{ color: colors.muted, fontSize: '0.85rem', marginTop: '0.25rem' }}>
                    GPA: {item.gpa}
                  </p>
                )}
                {item.description && (
                  <p
                    style={{
                      color: colors.muted,
                      fontSize: '0.875rem',
                      lineHeight: '1.6',
                      marginTop: '0.5rem',
                    }}
                  >
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
