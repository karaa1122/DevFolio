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

const SERIF = "'Fraunces', 'Playfair Display', Georgia, 'Times New Roman', serif";
const FRAUNCES_URL =
  'https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,400..700;1,9..144,400..700&display=swap';

/**
 * Editorial — magazine serifs on warm paper. A newspaper-style masthead with
 * double rules and oversized Fraunces headlines over the shared sections.
 */
export function EditorialTemplate({ portfolio, isExport = false }: TemplateProps) {
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
      {/* Template-owned display font — loaded here so it works on the public
          page, the editor preview, and the static export alike. */}
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link rel="stylesheet" href={FRAUNCES_URL} />
      <Css css={baseCraftCss(theme, isExport)} />
      {/* Serif headlines — stylesheet !important beats the sections' inline styles */}
      <Css css={`
        [data-portfolio-id] h1,
        [data-portfolio-id] h2,
        [data-portfolio-id] h3 {
          font-family: ${SERIF} !important;
          font-weight: 550 !important;
          letter-spacing: -0.015em !important;
        }
        [data-portfolio-id] .pf-card:hover,
        [data-portfolio-id] .pf-project-card:hover {
          transform: none !important;
          box-shadow: none !important;
        }
      `} />

      {/* Masthead — thick-over-thin newspaper rules */}
      <nav
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 100,
          backgroundColor: theme.colors.background,
          borderTop: `3px solid ${theme.colors.foreground}`,
          borderBottom: `1px solid ${theme.colors.border}`,
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
            fontFamily: SERIF,
            fontStyle: 'italic',
            fontWeight: '600',
            fontSize: '1.15rem',
            color: theme.colors.foreground,
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          {brandLabel}
        </span>
        <div className="pf-nav-links" style={{ display: 'flex', gap: '1.9rem', flexShrink: 0 }}>
          {orderedSections.map((s, i) => (
            <a
              key={s.id}
              href={`#${s.id}`}
              className="pf-nav-link"
              style={{
                color: theme.colors.muted,
                textDecoration: 'none',
                fontSize: '0.72rem',
                fontWeight: '600',
                letterSpacing: '0.16em',
                textTransform: 'uppercase',
                transition: 'color 0.2s',
              }}
            >
              <span style={{ color: theme.colors.primary, marginRight: '0.4rem' }}>
                {String(i + 1).padStart(2, '0')}
              </span>
              {s.type}
            </a>
          ))}
        </div>
      </nav>

      <RenderedSections sections={orderedSections} theme={theme} />

      {/* Colophon */}
      {!isExport && (
        <footer
          style={{
            borderTop: `3px double ${theme.colors.border}`,
            padding: '2.5rem 2rem',
            textAlign: 'center',
            color: theme.colors.muted,
            fontSize: '0.85rem',
          }}
        >
          <FooterCredit color={theme.colors.primary} />
        </footer>
      )}
    </div>
  );
}
