import React from 'react';
import type { AboutSection, Theme } from '@devfolio/shared';

interface Props {
  section: AboutSection;
  theme: Theme;
}

export function AboutSection({ section, theme }: Props) {
  const { data } = section;
  const { colors } = theme;
  const padding = theme.spacing === 'compact' ? '3rem 2rem' : theme.spacing === 'relaxed' ? '6rem 2rem' : '5rem 2rem';

  return (
    <section
      id={section.id}
      style={{
        backgroundColor: colors.card,
        color: colors.foreground,
        padding,
      }}
    >
      <div style={{ maxWidth: '900px', margin: '0 auto' }}>
        <h2
          style={{
            fontSize: 'clamp(1.75rem, 4vw, 2.5rem)',
            fontWeight: '700',
            color: colors.foreground,
            marginBottom: '1rem',
            textAlign: 'center',
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

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: data.image ? '1fr 1fr' : '1fr',
            gap: '3rem',
            alignItems: 'center',
          }}
        >
          <div>
            <p
              style={{
                fontSize: '1.125rem',
                lineHeight: '1.8',
                color: colors.muted,
                whiteSpace: 'pre-wrap',
              }}
            >
              {data.bio}
            </p>

            {data.highlights && data.highlights.length > 0 && (
              <ul
                style={{
                  marginTop: '1.5rem',
                  listStyle: 'none',
                  padding: 0,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.75rem',
                }}
              >
                {data.highlights.map((item, i) => (
                  <li
                    key={i}
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '0.75rem',
                      color: colors.muted,
                      fontSize: '1rem',
                    }}
                  >
                    <span style={{ color: colors.primary, flexShrink: 0 }}>▸</span>
                    {item}
                  </li>
                ))}
              </ul>
            )}
          </div>

          {data.image && (
            <img
              src={data.image}
              alt={data.heading}
              style={{
                width: '100%',
                borderRadius: theme.radius === 'none' ? '0' : theme.radius === 'sm' ? '8px' : theme.radius === 'md' ? '12px' : theme.radius === 'lg' ? '20px' : '50%',
                objectFit: 'cover',
                maxHeight: '400px',
              }}
            />
          )}
        </div>
      </div>
    </section>
  );
}
