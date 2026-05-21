import path from 'path';
import fs from 'fs/promises';
import { chromium } from 'playwright';
import { renderResumeToHtml } from '../renderers/resume.renderer';
import type { Resume } from '@devfolio/shared';

export interface ResumeExportResult {
  fileUrl: string;
  filePath: string;
  sizeBytes: number;
}

const UPLOADS_DIR = process.env.STORAGE_LOCAL_PATH ?? path.join(process.cwd(), 'uploads');

export async function processResumeExport(
  resume: Resume,
  jobId: string,
): Promise<ResumeExportResult> {
  await fs.mkdir(UPLOADS_DIR, { recursive: true });

  const html = renderResumeToHtml(resume);

  const browser = await chromium.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  try {
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle' });

    const isLetter = resume.theme.pageSize === 'letter';
    const pdfBuffer = await page.pdf({
      format: isLetter ? 'Letter' : 'A4',
      printBackground: false,
      margin: { top: '18mm', bottom: '18mm', left: '16mm', right: '16mm' },
    });

    const fileName = `resume-${jobId}.pdf`;
    const filePath = path.join(UPLOADS_DIR, fileName);
    await fs.writeFile(filePath, pdfBuffer);

    const fileUrl = `/api/v1/exports/download/${fileName}`;
    return { fileUrl, filePath, sizeBytes: pdfBuffer.length };
  } finally {
    await browser.close();
  }
}
