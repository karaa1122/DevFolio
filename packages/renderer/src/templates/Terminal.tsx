import React from 'react';
import {
  baseCraftCss,
  FooterCredit,
  getBrandLabel,
  RenderedSections,
  visibleSections,
  type TemplateProps,
} from './_chrome';

const MONO = "'JetBrains Mono', ui-monospace, 'SFMono-Regular', Menlo, monospace";
const MONO_URL =
  'https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600;700&display=swap';

/**
 * Terminal — a developer console aesthetic. Monospace everything, prompt-style
 * nav, square edges. Ignores the theme font on purpose: the mono face *is* the
 * template.
 */
export function TerminalTemplate({ portfolio, isExport = false }: TemplateProps) {
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
      }}
      data-portfolio-id={portfolio.id}
    >
      {/* Template-owned font — loaded here so it works on the public page,
          the editor preview, and the static export alike. */}
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link rel="stylesheet" href={MONO_URL} />
      <style>{baseCraftCss(theme, isExport)}</style>
      {/* Mono headlines + square edges — !important beats inline section styles */}
      <style>{`
        [data-portfolio-id] h1,
        [data-portfolio-id] h2,
        [data-portfolio-id] h3 {
          font-family: ${MONO} !important;
          letter-spacing: -0.02em !important;
        }
        [data-portfolio-id] section { border-top: 1px solid ${theme.colors.border}; }
        [data-portfolio-id] section:first-of-type { border-top: none; }
        [data-portfolio-id] .pf-card:hover,
        [data-portfolio-id] .pf-project-card:hover {
          transform: none !important;
          box-shadow: none !important;
          border-color: var(--pf-primary) !important;
        }
        @keyframes pf-blink { 0%, 55% { opacity: 1; } 56%, 100% { opacity: 0; } }
        [data-portfolio-id] .pf-cursor { animation: pf-blink 1.1s step-end infinite; }
      `}</style>

      {/* Prompt nav */}
      <nav
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 100,
          backgroundColor: theme.colors.background,
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
            minWidth: 0,
            fontWeight: '600',
            fontSize: '0.95rem',
            color: theme.colors.foreground,
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          <span style={{ color: theme.colors.primary }}>~/</span>
          {brandLabel.toLowerCase().replace(/\s+/g, '-')}
          <span className="pf-cursor" style={{ color: theme.colors.primary }}>
            ▋
          </span>
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
                fontSize: '0.8rem',
                fontWeight: '500',
                transition: 'color 0.2s',
              }}
            >
              ./{s.type}
            </a>
          ))}
        </div>
      </nav>

      <RenderedSections sections={orderedSections} theme={theme} />

      {/* Footer */}
      {!isExport && (
        <footer
          style={{
            borderTop: `1px solid ${theme.colors.border}`,
            padding: '2rem',
            textAlign: 'center',
            color: theme.colors.muted,
            fontSize: '0.8rem',
          }}
        >
          <span style={{ color: theme.colors.primary }}>[exit 0]</span>{' '}
          <FooterCredit color={theme.colors.primary} />
        </footer>
      )}
    </div>
  );
}
