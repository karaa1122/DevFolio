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
 * Minimal — quiet, airy, typographic. Flat chrome, hairline rules, soft
 * shadows. Designed light-first but respects whatever palette the user picks.
 */
export function MinimalTemplate({ portfolio, isExport = false }: TemplateProps) {
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
      }}
      data-portfolio-id={portfolio.id}
    >
      <Css css={baseCraftCss(theme, isExport)} />
      {/* Tone the craft layer down — minimal means no dramatic lifts or glows */}
      <Css css={`
        [data-portfolio-id] .pf-card:hover,
        [data-portfolio-id] .pf-project-card:hover {
          transform: translateY(-2px) !important;
          box-shadow: 0 12px 28px -20px rgba(0, 0, 0, 0.25) !important;
        }
        [data-portfolio-id] a[data-cta]:hover {
          transform: none !important;
          box-shadow: none !important;
          opacity: 0.85;
        }
        [data-portfolio-id] .pf-nav-link::after { height: 1px; bottom: -3px; }
      `} />

      {/* Navigation — flat, hairline, no glass */}
      <nav
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 100,
          backgroundColor: theme.colors.background,
          borderBottom: `1px solid ${theme.colors.border}`,
          padding: '1.1rem 2rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '2rem',
        }}
      >
        <span
          style={{
            minWidth: 0,
            fontWeight: '600',
            fontSize: '0.95rem',
            letterSpacing: '0.01em',
            color: theme.colors.foreground,
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          {brandLabel}
        </span>
        <div className="pf-nav-links" style={{ display: 'flex', gap: '2rem', flexShrink: 0 }}>
          {orderedSections.map((s) => (
            <a
              key={s.id}
              href={`#${s.id}`}
              className="pf-nav-link"
              style={{
                color: theme.colors.muted,
                textDecoration: 'none',
                fontSize: '0.8rem',
                fontWeight: '450',
                letterSpacing: '0.04em',
                textTransform: 'lowercase',
                transition: 'color 0.2s',
              }}
            >
              {s.type}
            </a>
          ))}
        </div>
      </nav>

      <RenderedSections sections={orderedSections} theme={theme} />

      {/* Footer — transparent, hairline */}
      {!isExport && (
        <footer
          style={{
            borderTop: `1px solid ${theme.colors.border}`,
            padding: '2.5rem 2rem',
            textAlign: 'center',
            color: theme.colors.muted,
            fontSize: '0.8rem',
            letterSpacing: '0.02em',
          }}
        >
          <FooterCredit color={theme.colors.foreground} />
        </footer>
      )}
    </div>
  );
}
