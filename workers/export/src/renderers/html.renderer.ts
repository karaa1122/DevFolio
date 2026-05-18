import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { PortfolioRenderer } from '@devfolio/renderer';
import type { Portfolio } from '@devfolio/shared';

const GOOGLE_FONTS_MAP: Record<string, string> = {
  inter: 'family=Inter:wght@400;500;600;700;800',
  roboto: 'family=Roboto:wght@400;500;700',
  poppins: 'family=Poppins:wght@400;500;600;700;800',
  'fira-code': 'family=Fira+Code:wght@400;500;600',
  'jetbrains-mono': 'family=JetBrains+Mono:wght@400;500;600',
};

export interface ExportOutput {
  html: string;
  configJson: string;
}

export function renderPortfolioToHtml(portfolio: Portfolio): ExportOutput {
  const font = portfolio.theme.font ?? 'inter';
  const fontQuery = GOOGLE_FONTS_MAP[font] ?? GOOGLE_FONTS_MAP['inter'];
  const { colors } = portfolio.theme;

  const bodyContent = renderToStaticMarkup(
    React.createElement(PortfolioRenderer, { portfolio, isExport: true }),
  );

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${escapeHtml(portfolio.metadata.title ?? `${portfolio.slug} | Portfolio`)}</title>
  ${portfolio.metadata.description ? `<meta name="description" content="${escapeHtml(portfolio.metadata.description)}" />` : ''}
  ${portfolio.metadata.keywords?.length ? `<meta name="keywords" content="${escapeHtml(portfolio.metadata.keywords.join(', '))}" />` : ''}
  <meta property="og:type" content="profile" />
  <meta property="og:title" content="${escapeHtml(portfolio.metadata.title ?? portfolio.slug)}" />
  ${portfolio.metadata.ogImage ? `<meta property="og:image" content="${escapeHtml(portfolio.metadata.ogImage)}" />` : ''}
  <meta name="twitter:card" content="summary_large_image" />
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?${fontQuery}&display=swap" rel="stylesheet" />
  <link rel="stylesheet" href="./styles.css" />
  ${portfolio.metadata.gaTrackingId ? `
  <script async src="https://www.googletagmanager.com/gtag/js?id=${portfolio.metadata.gaTrackingId}"></script>
  <script>
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());
    gtag('config', '${portfolio.metadata.gaTrackingId}');
  </script>` : ''}
</head>
<body>
  ${bodyContent}
</body>
</html>`;

  const configJson = JSON.stringify(
    { version: portfolio.version, slug: portfolio.slug, exportedAt: new Date().toISOString() },
    null,
    2,
  );

  return { html, configJson };
}

export function generateCss(portfolio: Portfolio): string {
  const { colors, font } = portfolio.theme;

  return `/* DevFolio Export — Generated CSS */
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
html { scroll-behavior: smooth; font-size: 16px; }
body {
  font-family: '${fontFamilyName(font)}', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  background-color: ${colors.background};
  color: ${colors.foreground};
  line-height: 1.5;
  -webkit-font-smoothing: antialiased;
}
img { max-width: 100%; display: block; }
a { color: inherit; }
input, textarea, button { font-family: inherit; }

/* Responsive */
@media (max-width: 768px) {
  section > div { padding-left: 1rem !important; padding-right: 1rem !important; }
  nav > div { padding: 0.75rem 1rem !important; }
  nav .nav-links { display: none !important; }
}

/* Scrollbar */
::-webkit-scrollbar { width: 6px; }
::-webkit-scrollbar-track { background: transparent; }
::-webkit-scrollbar-thumb { background: ${colors.border}; border-radius: 3px; }

/* Selection */
::selection { background: ${colors.primary}40; color: ${colors.foreground}; }
`;
}

function fontFamilyName(font: string): string {
  const names: Record<string, string> = {
    inter: 'Inter',
    roboto: 'Roboto',
    poppins: 'Poppins',
    'fira-code': 'Fira Code',
    'jetbrains-mono': 'JetBrains Mono',
  };
  return names[font] ?? 'Inter';
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}
