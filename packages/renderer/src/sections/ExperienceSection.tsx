import React from 'react';
import type { ExperienceSection, Theme } from '@devfolio/shared';
import { SectionHeader, sectionPadding, radiusMap, MONO } from './_shared';

interface Props {
  section: ExperienceSection;
  theme: Theme;
}

export function ExperienceSection({ section, theme }: Props) {
  const { data } = section;
  const { colors } = theme;
  const radius = radiusMap[theme.radius] ?? '16px';
  const isTimeline = data.layout === 'timeline';

  return (
    <section
      id={section.id}
      style={{ backgroundColor: colors.background, color: colors.foreground, padding: sectionPadding(theme) }}
    >
      <div style={{ maxWidth: '880px', margin: '0 auto' }}>
        <SectionHeader kicker="Career" heading={data.heading} theme={theme} />

        <div style={{ position: 'relative', paddingLeft: isTimeline ? '2.25rem' : '0' }}>
          {isTimeline && (
            <div
              style={{
                position: 'absolute',
                left: '0.5rem',
                top: '0.4rem',
                bottom: '0.4rem',
                width: '2px',
                background: `linear-gradient(${colors.primary}, ${colors.accent}, transparent)`,
                opacity: 0.5,
              }}
            />
          )}

          {data.items.map((item) => (
            <div
              key={item.id}
              className="pf-reveal pf-entry"
              style={{
                position: 'relative',
                marginBottom: '1.5rem',
                ...(isTimeline
                  ? {}
                  : {
                      backgroundColor: colors.card,
                      border: `1px solid ${colors.border}`,
                      borderRadius: radius,
                      padding: '1.5rem',
                    }),
              }}
            >
              {isTimeline && (
                <span
                  style={{
                    position: 'absolute',
                    left: '-1.85rem',
                    top: '0.35rem',
                    width: '14px',
                    height: '14px',
                    borderRadius: '50%',
                    background: item.current
                      ? `linear-gradient(135deg, ${colors.primary}, ${colors.accent})`
                      : colors.card,
                    border: `2px solid ${item.current ? colors.accent : colors.border}`,
                    boxShadow: item.current ? `0 0 0 4px ${colors.primary}22` : 'none',
                  }}
                />
              )}

              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  flexWrap: 'wrap',
                  gap: '0.5rem',
                  marginBottom: '0.4rem',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                  {item.logo && (
                    <img
                      src={item.logo}
                      alt={item.company}
                      style={{ width: '2.75rem', height: '2.75rem', borderRadius: '10px', objectFit: 'contain' }}
                    />
                  )}
                  <div>
                    <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: colors.foreground, margin: 0, letterSpacing: '-0.01em' }}>
                      {item.role}
                    </h3>
                    <p style={{ color: colors.primary, fontWeight: 600, margin: '0.15rem 0', fontSize: '0.95rem' }}>
                      {item.company}
                    </p>
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <span
                    style={{
                      fontFamily: MONO,
                      color: colors.muted,
                      fontSize: '0.78rem',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {item.startDate} — {item.current ? 'Present' : (item.endDate ?? '')}
                  </span>
                  {item.location && (
                    <p style={{ color: colors.muted, fontSize: '0.78rem', margin: '0.2rem 0 0' }}>{item.location}</p>
                  )}
                </div>
              </div>

              {item.type && (
                <span
                  style={{
                    display: 'inline-block',
                    backgroundColor: `${colors.accent}18`,
                    color: colors.accent,
                    padding: '0.15rem 0.6rem',
                    borderRadius: '999px',
                    fontSize: '0.72rem',
                    fontWeight: 500,
                    marginBottom: '0.85rem',
                    textTransform: 'capitalize',
                  }}
                >
                  {item.type}
                </span>
              )}

              {item.description && (
                <p
                  style={{
                    color: colors.muted,
                    fontSize: '0.95rem',
                    lineHeight: 1.7,
                    marginBottom: item.highlights.length > 0 ? '0.85rem' : 0,
                  }}
                >
                  {item.description}
                </p>
              )}

              {item.highlights.length > 0 && (
                <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
                  {item.highlights.map((h, i) => (
                    <li
                      key={i}
                      style={{ display: 'flex', alignItems: 'flex-start', gap: '0.6rem', color: colors.muted, fontSize: '0.9rem', lineHeight: 1.55 }}
                    >
                      <span
                        style={{
                          width: '5px',
                          height: '5px',
                          marginTop: '0.5rem',
                          borderRadius: '50%',
                          flexShrink: 0,
                          background: `linear-gradient(135deg, ${colors.primary}, ${colors.accent})`,
                        }}
                      />
                      {h}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
