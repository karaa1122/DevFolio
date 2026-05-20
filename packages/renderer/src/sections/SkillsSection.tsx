import React from 'react';
import type { SkillsSection, Theme } from '@devfolio/shared';

interface Props {
  section: SkillsSection;
  theme: Theme;
}

export function SkillsSection({ section, theme }: Props) {
  const { data } = section;
  const { colors } = theme;
  const padding = theme.spacing === 'compact' ? '3rem 2rem' : theme.spacing === 'relaxed' ? '6rem 2rem' : '5rem 2rem';

  const categories = Array.from(
    new Set(data.items.map((s) => s.category).filter(Boolean))
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
      style={{ backgroundColor: colors.card, color: colors.foreground, padding }}
    >
      <div style={{ maxWidth: '900px', margin: '0 auto' }}>
        <h2 style={{ fontSize: 'clamp(1.75rem, 4vw, 2.5rem)', fontWeight: '700', textAlign: 'center', marginBottom: '1rem' }}>
          {data.heading}
        </h2>
        {data.subheading && (
          <p style={{ textAlign: 'center', color: colors.muted, marginBottom: '1rem' }}>{data.subheading}</p>
        )}
        <div style={{ width: '3rem', height: '4px', backgroundColor: colors.primary, margin: '0 auto 3rem', borderRadius: '2px' }} />

        {grouped.map((group) => (
          <div key={group.label ?? 'default'} style={{ marginBottom: '2.5rem' }}>
            {group.label && (
              <h3 style={{ fontSize: '1rem', fontWeight: '600', color: colors.primary, marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                {group.label}
              </h3>
            )}

            {data.layout === 'tags' && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.625rem' }}>
                {group.items.map((skill) => (
                  <span
                    key={skill.id}
                    style={{
                      backgroundColor: `${colors.primary}15`,
                      color: colors.foreground,
                      border: `1px solid ${colors.border}`,
                      padding: '0.5rem 1rem',
                      borderRadius: theme.radius === 'none' ? '0' : '999px',
                      fontSize: '0.875rem',
                      fontWeight: '500',
                    }}
                  >
                    {skill.name}
                  </span>
                ))}
              </div>
            )}

            {data.layout === 'bars' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {group.items.map((skill) => (
                  <div key={skill.id}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.375rem' }}>
                      <span style={{ color: colors.foreground, fontWeight: '500', fontSize: '0.9rem' }}>{skill.name}</span>
                      {data.showLevels && skill.level !== undefined && (
                        <span style={{ color: colors.muted, fontSize: '0.8rem' }}>{skill.level}%</span>
                      )}
                    </div>
                    {skill.level !== undefined && (
                      <div style={{ height: '8px', backgroundColor: colors.border, borderRadius: '999px', overflow: 'hidden' }}>
                        <div
                          style={{
                            height: '100%',
                            width: `${skill.level}%`,
                            backgroundColor: colors.primary,
                            borderRadius: '999px',
                            transition: 'width 1s ease',
                          }}
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {data.layout === 'grid' && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '1rem' }}>
                {group.items.map((skill) => (
                  <div
                    key={skill.id}
                    style={{
                      backgroundColor: colors.background,
                      border: `1px solid ${colors.border}`,
                      padding: '1rem',
                      borderRadius: '8px',
                      textAlign: 'center',
                    }}
                  >
                    {skill.icon && <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>{skill.icon}</div>}
                    <div style={{ fontWeight: '600', color: colors.foreground, fontSize: '0.875rem' }}>{skill.name}</div>
                    {data.showLevels && skill.level !== undefined && (
                      <div style={{ color: colors.muted, fontSize: '0.75rem', marginTop: '0.25rem' }}>{skill.level}%</div>
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
