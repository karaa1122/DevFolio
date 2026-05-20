import React from 'react';
import type { HeroSection, Theme } from '@devfolio/shared';

interface Props {
  section: HeroSection;
  theme: Theme;
}

export function HeroSection({ section, theme }: Props) {
  const { data } = section;
  const { colors } = theme;

  return (
    <section
      id={section.id}
      style={{
        backgroundColor: colors.background,
        color: colors.foreground,
        padding:
          theme.spacing === 'compact'
            ? '4rem 2rem'
            : theme.spacing === 'relaxed'
              ? '8rem 2rem'
              : '6rem 2rem',
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
      }}
    >
      <div style={{ maxWidth: '800px', width: '100%' }}>
        {data.avatar && (
          <img
            src={data.avatar}
            alt={data.name}
            style={{
              width: '120px',
              height: '120px',
              borderRadius: '50%',
              objectFit: 'cover',
              margin: '0 auto 1.5rem',
              display: 'block',
              border: `3px solid ${colors.primary}`,
            }}
          />
        )}

        {data.availableForWork && (
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              backgroundColor: `${colors.accent}20`,
              color: colors.accent,
              padding: '0.25rem 0.75rem',
              borderRadius: '999px',
              fontSize: '0.875rem',
              marginBottom: '1.5rem',
            }}
          >
            <span
              style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                backgroundColor: colors.accent,
                display: 'inline-block',
              }}
            />
            Available for work
          </span>
        )}

        <h1
          style={{
            fontSize: 'clamp(2.5rem, 6vw, 4rem)',
            fontWeight: '800',
            color: colors.foreground,
            margin: '0 0 0.5rem',
            lineHeight: '1.1',
          }}
        >
          {data.name}
        </h1>

        <p
          style={{
            fontSize: 'clamp(1.25rem, 3vw, 1.75rem)',
            fontWeight: '500',
            color: colors.primary,
            margin: '0 0 1rem',
          }}
        >
          {data.title}
        </p>

        {data.subtitle && (
          <p
            style={{
              fontSize: '1.125rem',
              color: colors.muted,
              margin: '0 0 1rem',
            }}
          >
            {data.subtitle}
          </p>
        )}

        {data.bio && (
          <p
            style={{
              fontSize: '1rem',
              color: colors.muted,
              maxWidth: '600px',
              margin: '0 auto 2rem',
              lineHeight: '1.7',
            }}
          >
            {data.bio}
          </p>
        )}

        {data.location && (
          <p style={{ color: colors.muted, fontSize: '0.875rem', marginBottom: '2rem' }}>
            📍 {data.location}
          </p>
        )}

        {data.cta && (
          <a
            href={data.cta.href}
            style={{
              display: 'inline-block',
              padding: '0.875rem 2rem',
              backgroundColor: data.cta.variant === 'outline' ? 'transparent' : colors.primary,
              color: data.cta.variant === 'outline' ? colors.primary : colors.foreground,
              border: `2px solid ${colors.primary}`,
              borderRadius:
                theme.radius === 'none'
                  ? '0'
                  : theme.radius === 'sm'
                    ? '4px'
                    : theme.radius === 'md'
                      ? '8px'
                      : theme.radius === 'lg'
                        ? '12px'
                        : '999px',
              textDecoration: 'none',
              fontWeight: '600',
              fontSize: '1rem',
              transition: 'all 0.2s',
            }}
          >
            {data.cta.label}
          </a>
        )}
      </div>
    </section>
  );
}
