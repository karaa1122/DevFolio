import React from 'react';
import type { Theme } from '@devfolio/shared';

/** Modern, generous radius scale. */
export const radiusMap: Record<string, string> = {
  none: '0',
  sm: '8px',
  md: '16px',
  lg: '24px',
  full: '32px',
};

export function sectionPadding(theme: Theme): string {
  return theme.spacing === 'compact'
    ? '4.5rem 1.5rem'
    : theme.spacing === 'relaxed'
      ? '9rem 1.5rem'
      : '6.5rem 1.5rem';
}

export const MONO = "'JetBrains Mono', ui-monospace, 'SFMono-Regular', Menlo, monospace";

/** Pick black or white text for legibility on a given background hex. */
export function readableOn(hex: string): string {
  const c = hex.replace('#', '');
  if (c.length < 6) return '#ffffff';
  const r = parseInt(c.slice(0, 2), 16);
  const g = parseInt(c.slice(2, 4), 16);
  const b = parseInt(c.slice(4, 6), 16);
  const lum = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return lum > 0.6 ? '#0A0A0C' : '#ffffff';
}

/**
 * Editorial section header — a monospace kicker with a gradient tick, then an
 * oversized, tightly-tracked heading. Replaces the old centered "title + bar".
 */
export function SectionHeader({
  kicker,
  heading,
  subheading,
  theme,
  align = 'left',
}: {
  kicker: string;
  heading: string;
  subheading?: string;
  theme: Theme;
  align?: 'left' | 'center';
}) {
  const { colors } = theme;
  return (
    <div
      className="pf-reveal"
      style={{
        marginBottom: '3.25rem',
        textAlign: align,
        ...(align === 'center' ? { maxWidth: '680px', marginInline: 'auto' } : {}),
      }}
    >
      <div
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.65rem',
          marginBottom: '1.1rem',
        }}
      >
        <span
          style={{
            width: '2.25rem',
            height: '2px',
            borderRadius: '2px',
            background: `linear-gradient(90deg, ${colors.primary}, ${colors.accent})`,
          }}
        />
        <span
          style={{
            fontFamily: MONO,
            fontSize: '0.72rem',
            fontWeight: 600,
            letterSpacing: '0.22em',
            textTransform: 'uppercase',
            color: colors.primary,
          }}
        >
          {kicker}
        </span>
      </div>
      <h2
        style={{
          fontSize: 'clamp(2rem, 5vw, 3.25rem)',
          fontWeight: 800,
          letterSpacing: '-0.03em',
          lineHeight: 1.04,
          margin: 0,
          color: colors.foreground,
        }}
      >
        {heading}
      </h2>
      {subheading && (
        <p
          style={{
            marginTop: '0.95rem',
            color: colors.muted,
            fontSize: '1.075rem',
            lineHeight: 1.6,
            maxWidth: '46ch',
            ...(align === 'center' ? { marginInline: 'auto' } : {}),
          }}
        >
          {subheading}
        </p>
      )}
    </div>
  );
}

/** Tiny inline icon set (stroke-based) so we can drop the emoji. */
export function Icon({ name, color, size = 18 }: { name: string; color: string; size?: number }) {
  const common = {
    width: size,
    height: size,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: color,
    strokeWidth: 1.8,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
  };
  switch (name) {
    case 'mail':
      return (
        <svg {...common}>
          <rect x="2" y="4" width="20" height="16" rx="2" />
          <path d="m22 7-10 6L2 7" />
        </svg>
      );
    case 'phone':
      return (
        <svg {...common}>
          <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92Z" />
        </svg>
      );
    case 'pin':
      return (
        <svg {...common}>
          <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
          <circle cx="12" cy="10" r="3" />
        </svg>
      );
    case 'github':
      return (
        <svg {...common}>
          <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.4 5.4 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
          <path d="M9 18c-4.51 2-5-2-7-2" />
        </svg>
      );
    case 'linkedin':
      return (
        <svg {...common}>
          <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-4 0v7h-4v-7a6 6 0 0 1 6-6Z" />
          <rect x="2" y="9" width="4" height="12" />
          <circle cx="4" cy="4" r="2" />
        </svg>
      );
    case 'twitter':
      return (
        <svg {...common}>
          <path d="M4 4l11.5 16H20L8.5 4z" />
          <path d="M4 20 10 13M14 10 20 4" />
        </svg>
      );
    case 'website':
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="10" />
          <path d="M2 12h20" />
          <path d="M12 2a15 15 0 0 1 0 20 15 15 0 0 1 0-20" />
        </svg>
      );
    case 'youtube':
      return (
        <svg {...common}>
          <path d="M22 8.5a3 3 0 0 0-2.1-2.1C18 6 12 6 12 6s-6 0-7.9.4A3 3 0 0 0 2 8.5 31 31 0 0 0 2 12a31 31 0 0 0 .1 3.5 3 3 0 0 0 2.1 2.1C6 18 12 18 12 18s6 0 7.9-.4a3 3 0 0 0 2.1-2.1A31 31 0 0 0 22 12a31 31 0 0 0-.1-3.5Z" />
          <path d="m10 9 5 3-5 3z" fill={color} />
        </svg>
      );
    case 'devto':
      return (
        <svg {...common}>
          <rect x="2" y="5" width="20" height="14" rx="3" />
          <path d="M6 9v6M6 9h1.2a1.8 1.8 0 0 1 1.8 1.8v1.4A1.8 1.8 0 0 1 7.2 15H6" />
        </svg>
      );
    case 'arrow':
      return (
        <svg {...common}>
          <path d="M7 17 17 7" />
          <path d="M8 7h9v9" />
        </svg>
      );
    default:
      return null;
  }
}
