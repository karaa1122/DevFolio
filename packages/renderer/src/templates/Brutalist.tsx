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

const DISPLAY = "'Archivo Black', 'Arial Black', sans-serif";
const ARCHIVO_URL = 'https://fonts.googleapis.com/css2?family=Archivo+Black&display=swap';

/**
 * Brutalist — neo-brutalism. Thick ink borders, hard offset shadows,
 * huge uppercase Archivo Black headlines. No blur, no gradients, no mercy.
 */
export function BrutalistTemplate({ portfolio, isExport = false }: TemplateProps) {
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
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link rel="stylesheet" href={ARCHIVO_URL} />
      <Css css={baseCraftCss(theme, isExport)} />
      <Css css={`
        [data-portfolio-id] { --pf-ink: ${theme.colors.foreground}; }
        [data-portfolio-id] h1,
        [data-portfolio-id] h2 {
          font-family: ${DISPLAY} !important;
          text-transform: uppercase !important;
          letter-spacing: -0.01em !important;
        }
        /* Hard borders + offset shadows instead of soft glass */
        [data-portfolio-id] .pf-card,
        [data-portfolio-id] .pf-project-card {
          border: 3px solid var(--pf-ink) !important;
          border-radius: 0 !important;
          box-shadow: 7px 7px 0 var(--pf-ink) !important;
        }
        [data-portfolio-id] .pf-card:hover,
        [data-portfolio-id] .pf-project-card:hover {
          transform: translate(-3px, -3px) !important;
          border-color: var(--pf-ink) !important;
          box-shadow: 12px 12px 0 var(--pf-primary) !important;
        }
        [data-portfolio-id] .pf-tag,
        [data-portfolio-id] .pf-social {
          border: 2px solid var(--pf-ink) !important;
          border-radius: 0 !important;
        }
        [data-portfolio-id] .pf-tag:hover { box-shadow: 3px 3px 0 var(--pf-ink); }
        [data-portfolio-id] a[data-cta] {
          border: 3px solid var(--pf-ink) !important;
          border-radius: 0 !important;
          box-shadow: 5px 5px 0 var(--pf-ink) !important;
        }
        [data-portfolio-id] a[data-cta]:hover {
          transform: translate(-2px, -2px) !important;
          box-shadow: 8px 8px 0 var(--pf-ink) !important;
        }
      `} />

      {/* Navigation — a thick ruled bar */}
      <nav
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 100,
          backgroundColor: theme.colors.background,
          borderBottom: `3px solid ${theme.colors.foreground}`,
          padding: '1rem 2rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '2rem',
        }}
      >
        <span
          style={{
            minWidth: 0,
            fontFamily: DISPLAY,
            fontSize: '1rem',
            textTransform: 'uppercase',
            color: theme.colors.foreground,
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          {brandLabel}
          <span style={{ color: theme.colors.primary }}>.</span>
        </span>
        <div className="pf-nav-links" style={{ display: 'flex', gap: '1.6rem', flexShrink: 0 }}>
          {orderedSections.map((s) => (
            <a
              key={s.id}
              href={`#${s.id}`}
              className="pf-nav-link"
              style={{
                color: theme.colors.foreground,
                textDecoration: 'none',
                fontSize: '0.78rem',
                fontWeight: '800',
                letterSpacing: '0.06em',
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
            borderTop: `3px solid ${theme.colors.foreground}`,
            backgroundColor: theme.colors.primary,
            padding: '1.6rem 2rem',
            textAlign: 'center',
            color: theme.colors.foreground,
            fontSize: '0.8rem',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
          }}
        >
          <FooterCredit color={theme.colors.foreground} />
        </footer>
      )}
    </div>
  );
}
