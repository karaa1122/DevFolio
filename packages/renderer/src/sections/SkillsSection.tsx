import React from 'react';
import type { SkillsSection, Theme } from '@devfolio/shared';
import { SectionHeader, sectionPadding, radiusMap, MONO } from './_shared';

interface Props {
  section: SkillsSection;
  theme: Theme;
}

export function SkillsSection({ section, theme }: Props) {
  const { data } = section;
  const { colors } = theme;
  const radius = radiusMap[theme.radius] ?? '16px';

  const categories = Array.from(
    new Set(data.items.map((s) => s.category).filter(Boolean)),
  ) as string[];

  const grouped =
    categories.length > 0
      ? categories.map((cat) => ({
          label: cat,
          items: data.items.filter((s) => s.category === cat),
        }))
      : [{ label: null, items: data.items }];

  return (
    <section
      id={section.id}
      style={{ backgroundColor: colors.card, color: colors.foreground, padding: sectionPadding(theme) }}
    >
      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
        <SectionHeader kicker="Toolkit" heading={data.heading} subheading={data.subheading} theme={theme} />

        {grouped.map((group) => (
          <div key={group.label ?? 'default'} className="pf-reveal" style={{ marginBottom: '2.75rem' }}>
            {group.label && (
              <h3
                style={{
                  fontFamily: MONO,
                  fontSize: '0.78rem',
                  fontWeight: 600,
                  color: colors.muted,
                  marginBottom: '1.1rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.16em',
                }}
              >
                {group.label}
              </h3>
            )}

            {data.layout === 'tags' && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.6rem' }}>
                {group.items.map((skill) => (
                  <span
                    key={skill.id}
                    className="pf-tag"
                    style={{
                      backgroundColor: colors.background,
                      color: colors.foreground,
                      border: `1px solid ${colors.border}`,
                      padding: '0.55rem 1.05rem',
                      borderRadius: theme.radius === 'none' ? '0' : '999px',
                      fontSize: '0.9rem',
                      fontWeight: 500,
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                    }}
                  >
                    <span
                      style={{
                        width: '6px',
                        height: '6px',
                        borderRadius: '50%',
                        background: `linear-gradient(135deg, ${colors.primary}, ${colors.accent})`,
                      }}
                    />
                    {skill.name}
                  </span>
                ))}
              </div>
            )}

            {data.layout === 'bars' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.15rem' }}>
                {group.items.map((skill) => (
                  <div key={skill.id}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.45rem' }}>
                      <span style={{ color: colors.foreground, fontWeight: 600, fontSize: '0.92rem' }}>
                        {skill.name}
                      </span>
                      {data.showLevels && skill.level !== undefined && (
                        <span style={{ fontFamily: MONO, color: colors.muted, fontSize: '0.78rem' }}>
                          {skill.level}%
                        </span>
                      )}
                    </div>
                    {skill.level !== undefined && (
                      <div
                        className="pf-bar"
                        style={{
                          height: '7px',
                          backgroundColor: colors.border,
                          borderRadius: '999px',
                          overflow: 'hidden',
                        }}
                      >
                        <i
                          style={{
                            display: 'block',
                            height: '100%',
                            width: `${skill.level}%`,
                            borderRadius: '999px',
                            background: `linear-gradient(90deg, ${colors.primary}, ${colors.accent})`,
                          }}
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {data.layout === 'grid' && (
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
                  gap: '0.875rem',
                }}
              >
                {group.items.map((skill) => (
                  <div
                    key={skill.id}
                    className="pf-card"
                    style={{
                      backgroundColor: colors.background,
                      border: `1px solid ${colors.border}`,
                      padding: '1.25rem 1rem',
                      borderRadius: radius,
                      textAlign: 'center',
                    }}
                  >
                    {skill.icon && (
                      <div style={{ fontSize: '1.6rem', marginBottom: '0.5rem' }}>{skill.icon}</div>
                    )}
                    <div style={{ fontWeight: 600, color: colors.foreground, fontSize: '0.9rem' }}>
                      {skill.name}
                    </div>
                    {data.showLevels && skill.level !== undefined && (
                      <div style={{ fontFamily: MONO, color: colors.primary, fontSize: '0.72rem', marginTop: '0.35rem' }}>
                        {skill.level}%
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
