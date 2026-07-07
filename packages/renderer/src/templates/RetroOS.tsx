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
 * Retro OS — the portfolio as a desktop. A menu-bar nav, every section
 * rendered as a floating window (traffic lights + title bar via CSS
 * pseudo-elements and counters) over a wallpaper gradient, and a dock footer.
 */
export function RetroOSTemplate({ portfolio, isExport = false }: TemplateProps) {
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
      <Css css={`
        /* Wallpaper — an opaque gradient built from the accent colors, so the
           theme's background color stays free for the window interiors */
        [data-portfolio-id] {
          background-image:
            radial-gradient(1100px 600px at 18% -8%, color-mix(in srgb, var(--pf-accent) 45%, transparent), transparent),
            linear-gradient(165deg,
              color-mix(in srgb, var(--pf-primary) 80%, #16213c),
              color-mix(in srgb, var(--pf-primary) 45%, #16213c) 55%,
              color-mix(in srgb, var(--pf-accent) 50%, #16213c));
          background-attachment: fixed;
          counter-reset: pf-window;
          padding-bottom: 3rem;
        }

        /* Every section becomes a floating window */
        [data-portfolio-id] section {
          min-height: unset !important;
          position: relative;
          max-width: 1060px;
          margin: 2.4rem auto;
          width: calc(100% - 2.5rem);
          border: 1px solid color-mix(in srgb, ${theme.colors.border} 70%, #00000040);
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 30px 70px -30px rgba(0, 0, 0, 0.55), 0 4px 14px -6px rgba(0, 0, 0, 0.25);
          counter-increment: pf-window;
          scroll-margin-top: 4.5rem;
        }
        /* Title bar */
        [data-portfolio-id] section::before {
          content: 'portfolio — window 0' counter(pf-window);
          position: absolute;
          top: 0; left: 0; right: 0;
          height: 2.15rem;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.7rem;
          font-weight: 600;
          letter-spacing: 0.08em;
          color: ${theme.colors.muted};
          background: linear-gradient(180deg, color-mix(in srgb, ${theme.colors.card} 88%, #ffffff), color-mix(in srgb, ${theme.colors.card} 94%, #000000));
          border-bottom: 1px solid ${theme.colors.border};
          z-index: 20;
        }
        /* Traffic lights */
        [data-portfolio-id] section::after {
          content: '';
          position: absolute;
          top: 0.72rem; left: 0.95rem;
          width: 3.4rem; height: 0.72rem;
          z-index: 21;
          background:
            radial-gradient(circle at 0.36rem 50%, #ff5f57 0.33rem, transparent 0.4rem),
            radial-gradient(circle at 1.7rem 50%, #febc2e 0.33rem, transparent 0.4rem),
            radial-gradient(circle at 3.04rem 50%, #28c840 0.33rem, transparent 0.4rem);
        }
        /* Keep the mobile padding override from squashing windows */
        @media (max-width: 768px) {
          [data-portfolio-id] section { width: calc(100% - 1.5rem); margin: 1.4rem auto; }
        }
      `} />

      {/* Menu bar */}
      <nav
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 100,
          height: '2.3rem',
          backgroundColor: `${theme.colors.card}e6`,
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          borderBottom: `1px solid ${theme.colors.border}`,
          padding: '0 1.1rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '1.5rem',
        }}
      >
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            minWidth: 0,
            fontWeight: '700',
            fontSize: '0.82rem',
            color: theme.colors.foreground,
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          <span
            style={{
              width: '0.85rem',
              height: '0.85rem',
              borderRadius: '0.25rem',
              flexShrink: 0,
              background: `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.accent})`,
            }}
          />
          {brandLabel}
        </span>
        <div className="pf-nav-links" style={{ display: 'flex', gap: '1.2rem', flexShrink: 0 }}>
          {orderedSections.map((s) => (
            <a
              key={s.id}
              href={`#${s.id}`}
              className="pf-nav-link"
              style={{
                color: theme.colors.muted,
                textDecoration: 'none',
                fontSize: '0.78rem',
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

      {/* Dock */}
      {!isExport && (
        <footer style={{ display: 'flex', justifyContent: 'center', padding: '0 0 2rem' }}>
          <div
            style={{
              backgroundColor: `${theme.colors.card}cc`,
              backdropFilter: 'blur(14px)',
              WebkitBackdropFilter: 'blur(14px)',
              border: `1px solid ${theme.colors.border}`,
              borderRadius: '1rem',
              padding: '0.7rem 1.6rem',
              fontSize: '0.8rem',
              color: theme.colors.muted,
              boxShadow: '0 18px 40px -20px rgba(0,0,0,0.45)',
            }}
          >
            <FooterCredit color={theme.colors.primary} />
          </div>
        </footer>
      )}
    </div>
  );
}
