import React from 'react';
import type { AboutSection, Theme } from '@devfolio/shared';
import { SectionHeader, sectionPadding, radiusMap } from './_shared';

interface Props {
  section: AboutSection;
  theme: Theme;
}

export function AboutSection({ section, theme }: Props) {
  const { data } = section;
  const { colors } = theme;
  const radius = radiusMap[theme.radius] ?? '16px';

  return (
    <section
      id={section.id}
      style={{ backgroundColor: colors.card, color: colors.foreground, padding: sectionPadding(theme) }}
    >
      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
        <SectionHeader kicker="About" heading={data.heading} theme={theme} />

        <div
          className="pf-bento pf-reveal"
          style={{
            display: 'grid',
            gridTemplateColumns: data.image ? '1.4fr 1fr' : '1fr',
            gap: '2.5rem',
            alignItems: 'start',
          }}
        >
          <div>
            <p
              style={{
                fontSize: '1.25rem',
                lineHeight: 1.7,
                color: colors.foreground,
                whiteSpace: 'pre-wrap',
                fontWeight: 400,
                letterSpacing: '-0.01em',
              }}
            >
              {data.bio}
            </p>

            {data.highlights && data.highlights.length > 0 && (
              <div
                style={{
                  marginTop: '2rem',
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                  gap: '0.875rem',
                }}
              >
                {data.highlights.map((item, i) => (
                  <div
                    key={i}
                    className="pf-card"
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '0.75rem',
                      padding: '1rem 1.1rem',
                      backgroundColor: colors.background,
                      border: `1px solid ${colors.border}`,
                      borderRadius: radius,
                      color: colors.muted,
                      fontSize: '0.95rem',
                      lineHeight: 1.5,
                    }}
                  >
                    <span
                      style={{
                        width: '6px',
                        height: '6px',
                        marginTop: '0.5rem',
                        borderRadius: '50%',
                        flexShrink: 0,
                        background: `linear-gradient(135deg, ${colors.primary}, ${colors.accent})`,
                      }}
                    />
                    {item}
                  </div>
                ))}
              </div>
            )}
          </div>

          {data.image && (
            <div style={{ position: 'relative' }}>
              <div
                style={{
                  position: 'absolute',
                  inset: '-2px',
                  borderRadius: radius,
                  background: `linear-gradient(135deg, ${colors.primary}, ${colors.accent})`,
                  opacity: 0.6,
                  filter: 'blur(2px)',
                }}
              />
              <img
                src={data.image}
                alt={data.heading}
                style={{
                  position: 'relative',
                  width: '100%',
                  borderRadius: radius,
                  objectFit: 'cover',
                  maxHeight: '440px',
                  display: 'block',
                }}
              />
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
