import React from 'react';
import {
  baseCraftCss,
  Css,
  FONT_FAMILY,
  FooterCredit,
  getBrandLabel,
  RenderedSections,
  visibleSections,
  type TemplateProps,
} from './_chrome';

/**
 * Glitch — cyberpunk chromatic chaos. RGB-split headlines with jitter,
 * animated neon card borders, and a scanline haze. All CSS, no scripts;
 * motion is suppressed under prefers-reduced-motion.
 */
export function GlitchTemplate({ portfolio, isExport = false }: TemplateProps) {
  const { theme } = portfolio;
  const orderedSections = visibleSections(portfolio);
  const brandLabel = getBrandLabel(portfolio, orderedSections);

  return (
    <div
      style={{
        fontFamily: FONT_FAMILY[theme.font] ?? "'Inter', sans-serif",
        backgroundColor: theme.colors.background,
        color: theme.colors.foreground,
        minHeight: '100vh',
        position: 'relative',
      }}
      data-portfolio-id={portfolio.id}
    >
      <Css css={baseCraftCss(theme, isExport)} />
      <Css css={`
        /* Scanline haze over everything */
        [data-portfolio-id]::after {
          content: '';
          position: fixed; inset: 0; z-index: 90; pointer-events: none;
          background: repeating-linear-gradient(
            0deg, transparent 0 3px, rgba(0, 0, 0, 0.12) 3px 4px);
          mix-blend-mode: multiply;
        }
        /* RGB-split headline with occasional jitter */
        [data-portfolio-id] h1 {
          text-shadow:
            2px 0 0 color-mix(in srgb, var(--pf-primary) 85%, transparent),
            -2px 0 0 color-mix(in srgb, var(--pf-accent) 85%, transparent);
        }
        @media (prefers-reduced-motion: no-preference) {
          [data-portfolio-id] h1 { animation: pf-glitch 3.2s infinite steps(1); }
        }
        @keyframes pf-glitch {
          0%, 92% { transform: none; filter: none; }
          93% { transform: translate(-2px, 1px) skewX(-2deg); filter: hue-rotate(35deg); }
          94% { transform: translate(2px, -1px); filter: none; }
          95% { transform: translate(-1px, 0) skewX(1.5deg); filter: hue-rotate(-30deg); }
          96% { transform: none; filter: none; }
        }
        /* Neon border sweep on cards */
        [data-portfolio-id] .pf-card,
        [data-portfolio-id] .pf-project-card {
          position: relative;
          background-clip: padding-box;
        }
        [data-portfolio-id] .pf-card:hover,
        [data-portfolio-id] .pf-project-card:hover {
          transform: translateY(-4px) !important;
          border-color: var(--pf-primary) !important;
          box-shadow:
            0 0 0 1px var(--pf-primary),
            0 0 26px -6px var(--pf-primary),
            8px 0 32px -14px var(--pf-accent),
            -8px 0 32px -14px var(--pf-primary) !important;
        }
        [data-portfolio-id] .pf-tag:hover {
          color: var(--pf-accent) !important;
          border-color: var(--pf-accent) !important;
          text-shadow: 0 0 8px var(--pf-accent);
        }
        [data-portfolio-id] section h2 {
          text-shadow:
            1.5px 0 0 color-mix(in srgb, var(--pf-primary) 65%, transparent),
            -1.5px 0 0 color-mix(in srgb, var(--pf-accent) 65%, transparent);
        }
      `} />

      {/* Navigation */}
      <nav
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 100,
          backgroundColor: `${theme.colors.background}cc`,
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          borderBottom: `1px solid ${theme.colors.primary}55`,
          padding: '0.9rem 2rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '2rem',
        }}
      >
        <span
          style={{
            minWidth: 0,
            fontWeight: '800',
            fontSize: '1rem',
            letterSpacing: '0.05em',
            textTransform: 'uppercase',
            color: theme.colors.foreground,
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            textShadow: `1.5px 0 0 ${theme.colors.primary}, -1.5px 0 0 ${theme.colors.accent}`,
          }}
        >
          <span style={{ color: theme.colors.accent }}>SYS://</span>
          {brandLabel}
        </span>
        <div className="pf-nav-links" style={{ display: 'flex', gap: '1.6rem', flexShrink: 0 }}>
          {orderedSections.map((s) => (
            <a
              key={s.id}
              href={`#${s.id}`}
              className="pf-nav-link"
              style={{
                color: theme.colors.muted,
                textDecoration: 'none',
                fontSize: '0.78rem',
                fontWeight: '600',
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                transition: 'color 0.2s',
              }}
            >
              {s.type}
            </a>
          ))}
        </div>
      </nav>

      <RenderedSections sections={orderedSections} theme={theme} />

      {/* Footer */}
      {!isExport && (
        <footer
          style={{
            borderTop: `1px solid ${theme.colors.primary}55`,
            padding: '2rem',
            textAlign: 'center',
            color: theme.colors.muted,
            fontSize: '0.8rem',
            letterSpacing: '0.08em',
          }}
        >
          <span style={{ color: theme.colors.accent }}>[SIGNAL OK]</span>{' '}
          <FooterCredit color={theme.colors.primary} />
        </footer>
      )}
    </div>
  );
}
