import React from 'react';
import type { ExperienceSection, Theme } from '@devfolio/shared';

interface Props {
  section: ExperienceSection;
  theme: Theme;
}

const radiusMap: Record<string, string> = { none: '0', sm: '6px', md: '12px', lg: '20px', full: '24px' };

export function ExperienceSection({ section, theme }: Props) {
  const { data } = section;
  const { colors } = theme;
  const padding = theme.spacing === 'compact' ? '3rem 2rem' : theme.spacing === 'relaxed' ? '6rem 2rem' : '5rem 2rem';
  const radius = radiusMap[theme.radius] ?? '12px';

  return (
    <section
      id={section.id}
      style={{ backgroundColor: colors.background, color: colors.foreground, padding }}
    >
      <div style={{ maxWidth: '900px', margin: '0 auto' }}>
        <h2 style={{ fontSize: 'clamp(1.75rem, 4vw, 2.5rem)', fontWeight: '700', textAlign: 'center', marginBottom: '1rem' }}>
          {data.heading}
        </h2>
        <div style={{ width: '3rem', height: '4px', backgroundColor: colors.primary, margin: '0 auto 3rem', borderRadius: '2px' }} />

        <div
          style={{
            position: 'relative',
            paddingLeft: data.layout === 'timeline' ? '2rem' : '0',
          }}
        >
          {data.layout === 'timeline' && (
            <div
              style={{
                position: 'absolute',
                left: '0.5rem',
                top: 0,
                bottom: 0,
                width: '2px',
                backgroundColor: colors.border,
              }}
            />
          )}

          {data.items.map((item, index) => (
            <div
              key={item.id}
              style={{
                position: 'relative',
                marginBottom: '2.5rem',
                ...(data.layout === 'cards'
                  ? {
                      backgroundColor: colors.card,
                      border: `1px solid ${colors.border}`,
                      borderRadius: radius,
                      padding: '1.5rem',
                    }
                  : {}),
              }}
            >
              {data.layout === 'timeline' && (
                <div
                  style={{
                    position: 'absolute',
                    left: '-1.625rem',
                    top: '0.25rem',
                    width: '12px',
                    height: '12px',
                    borderRadius: '50%',
                    backgroundColor: item.current ? colors.primary : colors.border,
                    border: `2px solid ${colors.background}`,
                  }}
                />
              )}

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.25rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  {item.logo && (
                    <img src={item.logo} alt={item.company} style={{ width: '2.5rem', height: '2.5rem', borderRadius: '6px', objectFit: 'contain' }} />
                  )}
                  <div>
                    <h3 style={{ fontSize: '1.125rem', fontWeight: '700', color: colors.foreground, margin: 0 }}>
                      {item.role}
                    </h3>
                    <p style={{ color: colors.primary, fontWeight: '600', margin: '0.125rem 0', fontSize: '0.9rem' }}>
                      {item.company}
                    </p>
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <span style={{ color: colors.muted, fontSize: '0.85rem' }}>
                    {item.startDate} — {item.current ? 'Present' : (item.endDate ?? '')}
                  </span>
                  {item.location && (
                    <p style={{ color: colors.muted, fontSize: '0.8rem', margin: '0.125rem 0 0' }}>
                      {item.location}
                    </p>
                  )}
                </div>
              </div>

              {item.type && (
                <span
                  style={{
                    display: 'inline-block',
                    backgroundColor: `${colors.accent}15`,
                    color: colors.accent,
                    padding: '0.1rem 0.5rem',
                    borderRadius: '999px',
                    fontSize: '0.75rem',
                    marginBottom: '0.75rem',
                    textTransform: 'capitalize',
                  }}
                >
                  {item.type}
                </span>
              )}

              {item.description && (
                <p style={{ color: colors.muted, fontSize: '0.9rem', lineHeight: '1.7', marginBottom: item.highlights.length > 0 ? '0.75rem' : 0 }}>
                  {item.description}
                </p>
              )}

              {item.highlights.length > 0 && (
                <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
                  {item.highlights.map((h, i) => (
                    <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', color: colors.muted, fontSize: '0.875rem' }}>
                      <span style={{ color: colors.primary, flexShrink: 0, marginTop: '0.1rem' }}>▸</span>
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
