import path from 'path';
import fs from 'fs/promises';
import { getBrowser } from '../pdf/browser';
import { getInlinedFontCss } from '../pdf/font-cache';
import { renderResumeToHtml } from '../renderers/resume-html.renderer';
import type { Resume } from '@devfolio/shared';

const UPLOADS_DIR = process.env.STORAGE_LOCAL_PATH ?? path.join(process.cwd(), 'uploads');
const PDF_RENDER_TIMEOUT_MS = 30_000;

const MM_TO_INCH = 1 / 25.4;
const MARGIN_MM: Record<string, number> = { narrow: 10, normal: 14, wide: 20 };

export interface ResumePdfResult {
  fileUrl: string;
  filePath: string;
  sizeBytes: number;
}

export async function processResumePdfExport(
  resume: Resume,
  jobId: string,
): Promise<ResumePdfResult> {
  await fs.mkdir(UPLOADS_DIR, { recursive: true });

  const inlinedFontCss = getInlinedFontCss(resume.theme.font) ?? undefined;
  const { html } = renderResumeToHtml(resume, inlinedFontCss);

  const browser = await getBrowser();
  const context = await browser.newContext({
    viewport: { width: 1240, height: 1754 },
  });

  // Only block external requests when fonts aren't inlined (i.e. on the rare
  // first job before the font cache has warmed).
  if (!inlinedFontCss) {
    await context.route(/google-analytics|googletagmanager|doubleclick|hotjar/i, (route) =>
      route.abort(),
    );
  }

  const page = await context.newPage();
  try {
    // 'load' is sufficient: fonts are already embedded as base64 data URIs so
    // there are no outbound network requests.  When falling back to the Google
    // Fonts <link> we still wait for document.fonts.ready below, which handles
    // the font-file downloads more precisely than the old 'networkidle' did.
    await page.setContent(html, {
      waitUntil: 'load',
      timeout: PDF_RENDER_TIMEOUT_MS,
    });

    await page.evaluate(async () => {
      if (document.fonts) await document.fonts.ready;
    });

    const margin = MARGIN_MM[resume.page.margin] ?? 14;
    const marginIn = `${(margin * MM_TO_INCH).toFixed(3)}in`;

    const pdfBuffer = await page.pdf({
      format: resume.page.format === 'Letter' ? 'Letter' : 'A4',
      printBackground: true,
      preferCSSPageSize: true,
      // CSS-driven margin is preferred; this is a fallback for templates that
      // don't define @page margin.
      margin: { top: marginIn, right: marginIn, bottom: marginIn, left: marginIn },
    });

    const fileNameBase = (resume.metadata?.fileName ?? resume.slug)
      .replace(/\.pdf$/i, '')
      .toLowerCase()
      .replace(/[^a-z0-9-]/g, '-');
    const fileName = `resume-${fileNameBase}-${jobId}.pdf`;
    const filePath = path.join(UPLOADS_DIR, fileName);
    await fs.writeFile(filePath, pdfBuffer);

    const fileUrl = `/api/v1/exports/download/${fileName}`;
    return { fileUrl, filePath, sizeBytes: pdfBuffer.length };
  } finally {
    await context.close();
  }
}
