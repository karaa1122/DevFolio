import React from 'react';
import type { Portfolio } from '@devfolio/shared';
import { getOrderedSections } from '@devfolio/shared';
import { sectionRegistry } from './registry';

interface Props {
  portfolio: Portfolio;
  /** When true, renders a simplified version suitable for static HTML export */
  isExport?: boolean;
}

export function PortfolioRenderer({ portfolio, isExport = false }: Props) {
  const { theme, metadata } = portfolio;
  const orderedSections = getOrderedSections(portfolio).filter((s) => s.visible);

  const fontUrl: Record<string, string> = {
    inter: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap',
    roboto: 'https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&display=swap',
    poppins:
      'https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800&display=swap',
    'fira-code': 'https://fonts.googleapis.com/css2?family=Fira+Code:wght@400;500;600&display=swap',
    'jetbrains-mono':
      'https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600&display=swap',
  };

  const fontFamily: Record<string, string> = {
    inter: "'Inter', sans-serif",
    roboto: "'Roboto', sans-serif",
    poppins: "'Poppins', sans-serif",
    'fira-code': "'Fira Code', monospace",
    'jetbrains-mono': "'JetBrains Mono', monospace",
  };

  return (
    <div
      style={{
        fontFamily: fontFamily[theme.font] ?? "'Inter', sans-serif",
        backgroundColor: theme.colors.background,
        color: theme.colors.foreground,
        minHeight: '100vh',
      }}
      data-portfolio-id={portfolio.id}
    >
      {/* Craft layer — applies in both screen preview and static export.
          Uses the user's own theme colors via CSS custom properties so it
          adapts to whatever palette they picked. */}
      <style>{`
        [data-portfolio-id] {
          --pf-primary: ${theme.colors.primary};
          --pf-accent: ${theme.colors.accent};
          --pf-muted: ${theme.colors.muted};
          --pf-border: ${theme.colors.border};
          --pf-bg: ${theme.colors.background};
          scroll-behavior: smooth;
        }
        ${
          isExport
            ? `* { box-sizing: border-box; margin: 0; padding: 0; } body { margin: 0; } img { max-width: 100%; }`
            : ''
        }
        [data-portfolio-id] a { cursor: pointer; }
        [data-portfolio-id] section { scroll-margin-top: 5rem; }
        [data-portfolio-id] .pf-nav-link { position: relative; }
        [data-portfolio-id] .pf-nav-link::after {
          content: ''; position: absolute; left: 0; bottom: -4px; height: 2px; width: 0;
          background: var(--pf-primary); border-radius: 2px; transition: width 0.25s ease;
        }
        [data-portfolio-id] .pf-nav-link:hover { color: var(--pf-primary) !important; }
        [data-portfolio-id] .pf-nav-link:hover::after { width: 100%; }
        [data-portfolio-id] .pf-project-card { transition: transform 0.25s ease, box-shadow 0.25s ease, border-color 0.25s ease; }
        [data-portfolio-id] .pf-project-card:hover {
          transform: translateY(-4px);
          border-color: color-mix(in srgb, var(--pf-primary) 50%, var(--pf-border));
          box-shadow: 0 18px 40px -18px rgba(0,0,0,0.45);
        }
        [data-portfolio-id] a[data-cta]:hover { transform: translateY(-2px); box-shadow: 0 12px 28px -10px color-mix(in srgb, var(--pf-primary) 60%, transparent); }
        @keyframes pf-pulse { 0%,100% { opacity: 1; transform: scale(1); } 50% { opacity: 0.55; transform: scale(0.85); } }
        [data-portfolio-id] .pf-pulse { animation: pf-pulse 2s ease-in-out infinite; }

        /* Generic glass card hover lift */
        [data-portfolio-id] .pf-card { transition: transform 0.28s ease, box-shadow 0.28s ease, border-color 0.28s ease; }
        [data-portfolio-id] .pf-card:hover {
          transform: translateY(-4px);
          border-color: color-mix(in srgb, var(--pf-primary) 45%, var(--pf-border));
          box-shadow: 0 20px 44px -22px rgba(0,0,0,0.5);
        }
        /* Skill tag hover */
        [data-portfolio-id] .pf-tag { transition: transform 0.2s ease, border-color 0.2s ease, background 0.2s ease, color 0.2s ease; }
        [data-portfolio-id] .pf-tag:hover {
          transform: translateY(-2px);
          border-color: color-mix(in srgb, var(--pf-primary) 60%, var(--pf-border));
          color: var(--pf-primary);
        }
        /* Social icon button hover → fills with the accent */
        [data-portfolio-id] .pf-social { transition: transform 0.2s ease, border-color 0.2s ease, background 0.2s ease, color 0.2s ease; }
        [data-portfolio-id] .pf-social:hover {
          transform: translateY(-3px);
          background: var(--pf-primary);
          border-color: var(--pf-primary);
        }
        [data-portfolio-id] .pf-social:hover svg { stroke: var(--pf-bg, #fff); }
        /* Timeline entry hover */
        [data-portfolio-id] .pf-entry { transition: transform 0.25s ease; }
        [data-portfolio-id] .pf-entry:hover { transform: translateX(4px); }

        /* Scroll-reveal — progressive enhancement; falls back to fully visible */
        @supports (animation-timeline: view()) {
          @media (prefers-reduced-motion: no-preference) {
            [data-portfolio-id] .pf-reveal {
              opacity: 0;
              animation: pf-reveal-in linear both;
              animation-timeline: view();
              animation-range: entry 0% cover 22%;
            }
          }
        }
        @keyframes pf-reveal-in { from { opacity: 0; transform: translateY(26px); } to { opacity: 1; transform: none; } }
        /* Animated skill bars on reveal */
        @supports (animation-timeline: view()) {
          @media (prefers-reduced-motion: no-preference) {
            [data-portfolio-id] .pf-bar > i {
              transform: scaleX(0); transform-origin: left;
              animation: pf-bar-grow linear both;
              animation-timeline: view();
              animation-range: entry 0% cover 30%;
            }
          }
        }
        @keyframes pf-bar-grow { to { transform: scaleX(1); } }

        @media (max-width: 768px) {
          [data-portfolio-id] section > div { padding-left: 1.25rem !important; padding-right: 1.25rem !important; }
          [data-portfolio-id] .pf-nav-links { display: none !important; }
          [data-portfolio-id] .pf-bento { grid-template-columns: 1fr !important; }
        }
      `}</style>

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
        }}
      >
        <span
          style={{
            fontWeight: '700',
            fontSize: '1.05rem',
            letterSpacing: '-0.02em',
            background: `linear-gradient(120deg, ${theme.colors.primary}, ${theme.colors.accent})`,
            WebkitBackgroundClip: 'text',
            backgroundClip: 'text',
            color: 'transparent',
          }}
        >
          {metadata.title ?? 'Portfolio'}
        </span>
        <div className="pf-nav-links" style={{ display: 'flex', gap: '1.75rem' }}>
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

      {/* Sections */}
      {orderedSections.map((section) => {
        const Component = sectionRegistry[section.type];
        if (!Component) return null;
        return <Component key={section.id} section={section as never} theme={theme} />;
      })}

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
          Built with{' '}
          <a
            href="https://devfolioapp.cloud"
            style={{ color: theme.colors.primary, textDecoration: 'none' }}
          >
            DevFolio
          </a>
        </footer>
      )}
    </div>
  );
}
