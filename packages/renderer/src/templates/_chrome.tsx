import React from 'react';
import type { Portfolio, Section, Theme } from '@devfolio/shared';
import { getOrderedSections } from '@devfolio/shared';
import { sectionRegistry } from '../registry';

export interface TemplateProps {
  portfolio: Portfolio;
  /** When true, renders a simplified version suitable for static HTML export */
  isExport?: boolean;
}

export const FONT_FAMILY: Record<string, string> = {
  inter: "'Inter', sans-serif",
  roboto: "'Roboto', sans-serif",
  poppins: "'Poppins', sans-serif",
  'fira-code': "'Fira Code', monospace",
  'jetbrains-mono': "'JetBrains Mono', monospace",
};

export function visibleSections(portfolio: Portfolio): Section[] {
  return getOrderedSections(portfolio).filter((s) => s.visible);
}

/**
 * Keep the nav brand short — prefer the hero name over the (often long) SEO
 * title so it doesn't crowd the nav links.
 */
export function getBrandLabel(portfolio: Portfolio, sections: Section[]): string {
  const heroSection = sections.find((s) => s.type === 'hero');
  return (
    (heroSection?.type === 'hero' ? heroSection.data.name : undefined) ??
    portfolio.metadata.title ??
    'Portfolio'
  );
}

/** The ordered, visible sections rendered through the shared section registry. */
export function RenderedSections({ sections, theme }: { sections: Section[]; theme: Theme }) {
  return (
    <>
      {sections.map((section) => {
        const Component = sectionRegistry[section.type];
        if (!Component) return null;
        return <Component key={section.id} section={section as never} theme={theme} />;
      })}
    </>
  );
}

/**
 * Craft layer shared by every template — applies in both screen preview and
 * static export. Uses the user's own theme colors via CSS custom properties so
 * it adapts to whatever palette they picked.
 */
export function baseCraftCss(theme: Theme, isExport: boolean): string {
  return `
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
  `;
}

/**
 * Style tag that injects CSS verbatim. React HTML-escapes plain text children
 * of <style> (quotes become &#x27;), which silently breaks any rule containing
 * a string — font names, content:'' — so always emit template CSS through this.
 */
export function Css({ css }: { css: string }) {
  return <style dangerouslySetInnerHTML={{ __html: css }} />;
}

/** Standard "Built with DevFolio" credit used by template footers. */
export function FooterCredit({ color }: { color: string }) {
  return (
    <>
      Built with{' '}
      <a href="https://devfolioapp.cloud" style={{ color, textDecoration: 'none' }}>
        DevFolio
      </a>
    </>
  );
}
