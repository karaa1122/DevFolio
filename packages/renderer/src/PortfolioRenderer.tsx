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
      {isExport && (
        <style>{`
          * { box-sizing: border-box; margin: 0; padding: 0; }
          body { margin: 0; }
          img { max-width: 100%; }
          a { cursor: pointer; }
          @media (max-width: 768px) {
            [data-portfolio-id] section > div { padding-left: 1rem !important; padding-right: 1rem !important; }
          }
        `}</style>
      )}

      {/* Navigation */}
      <nav
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 100,
          backgroundColor: `${theme.colors.background}e6`,
          backdropFilter: 'blur(12px)',
          borderBottom: `1px solid ${theme.colors.border}`,
          padding: '1rem 2rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <span style={{ fontWeight: '700', color: theme.colors.foreground, fontSize: '1.125rem' }}>
          {metadata.title ?? 'Portfolio'}
        </span>
        <div style={{ display: 'flex', gap: '1.5rem' }}>
          {orderedSections.map((s) => (
            <a
              key={s.id}
              href={`#${s.id}`}
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
