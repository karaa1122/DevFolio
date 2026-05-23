import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { ResumeRenderer, buildResumeFontLink } from '@devfolio/renderer';
import type { Resume } from '@devfolio/shared';

export interface ResumeHtmlOutput {
  html: string;
}

/**
 * Server-renders the resume into a full HTML document that Playwright can
 * load directly. We rely on Chromium's own print engine to paginate via the
 * `@page` + `break-inside` CSS injected by the renderer — no JS measurement
 * happens at PDF time.
 */
export function renderResumeToHtml(resume: Resume): ResumeHtmlOutput {
  const fontHref = buildResumeFontLink(resume);
  const body = renderToStaticMarkup(
    React.createElement(ResumeRenderer, { resume, mode: 'print' }),
  );

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${escapeHtml(resume.metadata?.title ?? resume.slug)}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link rel="stylesheet" href="${escapeHtml(fontHref)}" />
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    html, body { background: #ffffff; }
    body { margin: 0; }
  </style>
</head>
<body>
${body}
</body>
</html>`;

  return { html };
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}
