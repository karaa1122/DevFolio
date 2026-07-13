import React from 'react';
import {
  baseCraftCss,
  Css,
  FooterCredit,
  getBrandLabel,
  RenderedSections,
  visibleSections,
  type TemplateProps,
} from './_chrome';

const PIXEL = "'Press Start 2P', 'Courier New', monospace";
const MONO = "'JetBrains Mono', ui-monospace, Menlo, monospace";
const FONTS_URL =
  'https://fonts.googleapis.com/css2?family=Press+Start+2P&family=JetBrains+Mono:wght@400;500;600;700&display=swap';

/**
 * Arcade — 8-bit pixels behind CRT glass. Press Start 2P headlines (sized
 * down — the pixel font runs huge), chunky drop-edge cards, scanlines and a
 * blinking INSERT COIN. Body copy stays in a readable mono.
 */
export function ArcadeTemplate({ portfolio, isExport = false }: TemplateProps) {
  const { theme } = portfolio;
  const orderedSections = visibleSections(portfolio);
  const brandLabel = getBrandLabel(portfolio, orderedSections);

  return (
    <div
      style={{
        fontFamily: MONO,
        backgroundColor: theme.colors.background,
        color: theme.colors.foreground,
        minHeight: '100vh',
        position: 'relative',
      }}
      data-portfolio-id={portfolio.id}
    >
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link rel="stylesheet" href={FONTS_URL} />
      <Css css={baseCraftCss(theme, isExport)} />
      <Css css={`
        /* CRT scanlines + corner vignette */
        [data-portfolio-id]::after {
          content: '';
          position: fixed; inset: 0; z-index: 90; pointer-events: none;
          background:
            repeating-linear-gradient(0deg, transparent 0 2px, rgba(0,0,0,0.16) 2px 3px),
            radial-gradient(ellipse at center, transparent 58%, rgba(0,0,0,0.38) 100%);
        }
        /* Pixel headlines — Press Start 2P renders enormous, so cap sizes */
        [data-portfolio-id] h1 {
          font-family: ${PIXEL} !important;
          font-size: clamp(1.3rem, 3.4vw, 2.3rem) !important;
          line-height: 1.5 !important;
          letter-spacing: 0 !important;
          text-shadow: 3px 3px 0 color-mix(in srgb, var(--pf-primary) 60%, #000000);
        }
        [data-portfolio-id] h2 {
          font-family: ${PIXEL} !important;
          font-size: clamp(0.85rem, 2vw, 1.3rem) !important;
          line-height: 1.6 !important;
          letter-spacing: 0 !important;
        }
        /* Pixel-hard cards: no radius, chunky drop edge */
        [data-portfolio-id] .pf-card,
        [data-portfolio-id] .pf-project-card {
          border: 3px solid var(--pf-border) !important;
          border-radius: 0 !important;
          box-shadow: 0 6px 0 -2px color-mix(in srgb, var(--pf-border) 80%, #000000) !important;
        }
        [data-portfolio-id] .pf-card:hover,
        [data-portfolio-id] .pf-project-card:hover {
          transform: translateY(-4px) !important;
          border-color: var(--pf-primary) !important;
          box-shadow: 0 10px 0 -2px color-mix(in srgb, var(--pf-primary) 70%, #000000) !important;
        }
        [data-portfolio-id] a[data-cta] {
          border-radius: 0 !important;
          box-shadow: 0 5px 0 -1px color-mix(in srgb, var(--pf-primary) 55%, #000000) !important;
        }
        [data-portfolio-id] a[data-cta]:hover {
          transform: translateY(2px) !important;
          box-shadow: 0 3px 0 -1px color-mix(in srgb, var(--pf-primary) 55%, #000000) !important;
        }
        [data-portfolio-id] .pf-tag, [data-portfolio-id] .pf-social { border-radius: 0 !important; }
        @keyframes pf-coin-blink { 0%, 60% { opacity: 1; } 61%, 100% { opacity: 0.15; } }
        [data-portfolio-id] .pf-coin { animation: pf-coin-blink 1.3s step-end infinite; }
      `} />

      {/* Navigation — the HUD */}
      <nav
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 100,
          backgroundColor: theme.colors.background,
          borderBottom: `3px solid ${theme.colors.border}`,
          padding: '0.85rem 2rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '2rem',
        }}
      >
        <span
          style={{
            minWidth: 0,
            fontFamily: PIXEL,
            fontSize: '0.68rem',
            color: theme.colors.primary,
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            textShadow: `2px 2px 0 ${theme.colors.background === '#ffffff' ? '#00000030' : '#00000080'}`,
          }}
        >
          ▶ {brandLabel.toUpperCase()}
        </span>
        <div className="pf-nav-links" style={{ display: 'flex', gap: '1.5rem', flexShrink: 0 }}>
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
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
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
            borderTop: `3px solid ${theme.colors.border}`,
            padding: '2rem',
            textAlign: 'center',
            color: theme.colors.muted,
            fontSize: '0.75rem',
          }}
        >
          <div
            className="pf-coin"
            style={{
              fontFamily: PIXEL,
              fontSize: '0.62rem',
              color: theme.colors.primary,
              marginBottom: '0.9rem',
            }}
          >
            INSERT COIN TO CONTINUE
          </div>
          <FooterCredit color={theme.colors.primary} />
        </footer>
      )}
    </div>
  );
}
