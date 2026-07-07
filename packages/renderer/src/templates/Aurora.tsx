import React from 'react';
import {
  baseCraftCss,
  FONT_FAMILY,
  FooterCredit,
  getBrandLabel,
  RenderedSections,
  visibleSections,
  type TemplateProps,
} from './_chrome';

/**
 * Aurora — the signature DevFolio template. Near-black glass chrome with a
 * gradient brand dot and the full craft/motion layer.
 */
export function AuroraTemplate({ portfolio, isExport = false }: TemplateProps) {
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
      <style>{baseCraftCss(theme, isExport)}</style>

      {/* Navigation */}
      <nav
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 100,
          backgroundColor: `${theme.colors.background}d9`,
          backdropFilter: 'blur(14px)',
          WebkitBackdropFilter: 'blur(14px)',
          borderBottom: `1px solid ${theme.colors.border}`,
          padding: '0.9rem 2rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '2rem',
        }}
      >
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            minWidth: 0,
            fontWeight: '700',
            fontSize: '1.05rem',
            letterSpacing: '-0.02em',
            color: theme.colors.foreground,
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          <span
            style={{
              width: '0.55rem',
              height: '0.55rem',
              borderRadius: '50%',
              flexShrink: 0,
              background: `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.accent})`,
            }}
          />
          {brandLabel}
        </span>
        <div className="pf-nav-links" style={{ display: 'flex', gap: '1.75rem', flexShrink: 0 }}>
          {orderedSections.map((s) => (
            <a
              key={s.id}
              href={`#${s.id}`}
              className="pf-nav-link"
              style={{
                color: theme.colors.muted,
                textDecoration: 'none',
                fontSize: '0.875rem',
                fontWeight: '500',
                textTransform: 'capitalize',
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
            backgroundColor: theme.colors.card,
            borderTop: `1px solid ${theme.colors.border}`,
            padding: '2rem',
            textAlign: 'center',
            color: theme.colors.muted,
            fontSize: '0.875rem',
          }}
        >
          <FooterCredit color={theme.colors.primary} />
        </footer>
      )}
    </div>
  );
}
