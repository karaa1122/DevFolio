import { Worker, type Job } from 'bullmq';
import { Pool } from 'pg';
import IORedis from 'ioredis';
import { processExport } from './processors/export.processor';
import { processResumePdfExport } from './processors/resume-pdf.processor';
import { closeBrowser } from './pdf/browser';
import { startWarmFontCache } from './pdf/font-cache';
import type { Portfolio, Resume } from '@devfolio/shared';

const PORTFOLIO_QUEUE = 'export-portfolio';
const RESUME_PDF_QUEUE = 'export-resume-pdf';

interface PortfolioExportJobData {
  portfolioId: string;
  exportJobId: string;
}

interface ResumePdfJobData {
  resumeId: string;
  exportJobId: string;
}

// ─── Redis connection ──────────────────────────────────────────────────────

const redis = new IORedis({
  host: process.env.REDIS_HOST ?? 'localhost',
  port: parseInt(process.env.REDIS_PORT ?? '6379', 10),
  maxRetriesPerRequest: null,
});

// ─── Postgres connection ───────────────────────────────────────────────────

const db = new Pool({
  connectionString:
    process.env.DATABASE_URL ?? 'postgresql://devfolio:devfolio@localhost:5432/devfolio',
});

// ─── Database helpers ──────────────────────────────────────────────────────

async function getPortfolio(portfolioId: string): Promise<Portfolio> {
  const result = await db.query('SELECT data FROM portfolios WHERE id = $1', [portfolioId]);
  if (result.rows.length === 0) throw new Error(`Portfolio ${portfolioId} not found`);
  return result.rows[0].data as Portfolio;
}

async function getResume(resumeId: string): Promise<Resume> {
  const result = await db.query('SELECT data FROM resumes WHERE id = $1', [resumeId]);
  if (result.rows.length === 0) throw new Error(`Resume ${resumeId} not found`);
  return result.rows[0].data as Resume;
}

async function updateExportJob(
  jobId: string,
  status: 'processing' | 'completed' | 'failed',
  updates: { fileUrl?: string; errorMessage?: string; completedAt?: Date } = {},
) {
  const sets: string[] = ['status = $2', '"updatedAt" = NOW()'];
  const values: unknown[] = [jobId, status];
  let i = 3;

  if (updates.fileUrl) {
    sets.push(`"fileUrl" = $${i++}`);
    values.push(updates.fileUrl);
  }
  if (updates.errorMessage) {
    sets.push(`"errorMessage" = $${i++}`);
    values.push(updates.errorMessage);
  }
  if (updates.completedAt) {
    sets.push(`"completedAt" = $${i++}`);
    values.push(updates.completedAt);
  }

  await db.query(`UPDATE export_jobs SET ${sets.join(', ')} WHERE id = $1`, values);
}

// ─── Portfolio (ZIP) worker ────────────────────────────────────────────────

const portfolioWorker = new Worker<PortfolioExportJobData>(
  PORTFOLIO_QUEUE,
  async (job: Job<PortfolioExportJobData>) => {
    const { portfolioId, exportJobId } = job.data;
    console.log(`[Export] portfolio job ${exportJobId} for portfolio ${portfolioId}`);

    await updateExportJob(exportJobId, 'processing');
    await job.updateProgress(10);

    const portfolio = await getPortfolio(portfolioId);
    await job.updateProgress(30);

    const result = await processExport(portfolio, exportJobId);
    await job.updateProgress(90);

    await updateExportJob(exportJobId, 'completed', {
      fileUrl: result.fileUrl,
      completedAt: new Date(),
    });
    await job.updateProgress(100);

    console.log(
      `[Export] portfolio job ${exportJobId} done. File: ${result.fileUrl} (${(result.sizeByes / 1024).toFixed(1)} KB)`,
    );

    return { fileUrl: result.fileUrl };
  },
  {
    connection: redis,
    concurrency: 3,
    limiter: { max: 10, duration: 60_000 },
  },
);

// ─── Resume PDF worker ─────────────────────────────────────────────────────

const resumePdfWorker = new Worker<ResumePdfJobData>(
  RESUME_PDF_QUEUE,
  async (job: Job<ResumePdfJobData>) => {
    const { resumeId, exportJobId } = job.data;
    console.log(`[Export] resume-pdf job ${exportJobId} for resume ${resumeId}`);

    await updateExportJob(exportJobId, 'processing');
    await job.updateProgress(10);

    const resume = await getResume(resumeId);
    await job.updateProgress(30);

    const result = await processResumePdfExport(resume, exportJobId);
    await job.updateProgress(90);

    await updateExportJob(exportJobId, 'completed', {
      fileUrl: result.fileUrl,
      completedAt: new Date(),
    });
    await job.updateProgress(100);

    console.log(
      `[Export] resume-pdf job ${exportJobId} done. File: ${result.fileUrl} (${(result.sizeBytes / 1024).toFixed(1)} KB)`,
    );

    return { fileUrl: result.fileUrl };
  },
  {
    connection: redis,
    // Chromium is heavy — keep concurrency low per worker process.
    concurrency: 2,
    limiter: { max: 6, duration: 60_000 },
  },
);

const onFailed = (workerName: string) => async (job: Job | undefined, err: Error) => {
  if (!job) return;
  const exportJobId = (job.data as { exportJobId?: string }).exportJobId;
  console.error(`[${workerName}] Job ${exportJobId ?? job.id} failed:`, err.message);
  if (exportJobId) {
    await updateExportJob(exportJobId, 'failed', {
      errorMessage: err.message,
    }).catch(console.error);
  }
};

portfolioWorker.on('failed', onFailed('Export/portfolio'));
resumePdfWorker.on('failed', onFailed('Export/resume-pdf'));

portfolioWorker.on('error', (err) => console.error('[Export/portfolio] worker error:', err));
resumePdfWorker.on('error', (err) => console.error('[Export/resume-pdf] worker error:', err));

// ─── Graceful shutdown ─────────────────────────────────────────────────────

async function shutdown() {
  console.log('[Export Worker] Shutting down...');
  await Promise.allSettled([portfolioWorker.close(), resumePdfWorker.close()]);
  await closeBrowser();
  await redis.quit();
  await db.end();
  process.exit(0);
}

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);

// Kick off font download immediately so the cache is warm before the first PDF
// job arrives. Jobs that arrive before warming finishes fall back to the
// Google Fonts <link> tag automatically (see resume-pdf.processor.ts).
startWarmFontCache();

console.log(`[Export Worker] Listening on queues: ${PORTFOLIO_QUEUE}, ${RESUME_PDF_QUEUE}`);
console.log(
  `[Export Worker] Redis: ${process.env.REDIS_HOST ?? 'localhost'}:${process.env.REDIS_PORT ?? 6379}`,
);
