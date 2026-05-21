import { Worker, type Job } from 'bullmq';
import { Pool } from 'pg';
import IORedis from 'ioredis';
import { processExport } from './processors/export.processor';
import { processResumeExport } from './processors/resume.processor';
import type { Portfolio, Resume } from '@devfolio/shared';

const QUEUE_NAME = 'export-portfolio';
const RESUME_QUEUE_NAME = 'export-resume';

interface ExportJobData {
  portfolioId: string;
  exportJobId: string;
}

interface ResumeExportJobData {
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

  await db.query(
    `UPDATE export_jobs SET ${sets.join(', ')} WHERE id = $1`,
    values,
  );
}

// ─── Worker ────────────────────────────────────────────────────────────────

const worker = new Worker<ExportJobData>(
  QUEUE_NAME,
  async (job: Job<ExportJobData>) => {
    const { portfolioId, exportJobId } = job.data;
    console.log(`[Export Worker] Processing job ${exportJobId} for portfolio ${portfolioId}`);

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
      `[Export Worker] Job ${exportJobId} completed. File: ${result.fileUrl} (${(result.sizeByes / 1024).toFixed(1)} KB)`,
    );

    return { fileUrl: result.fileUrl };
  },
  {
    connection: redis,
    concurrency: 3,
    limiter: { max: 10, duration: 60000 },
  },
);

worker.on('failed', async (job, err) => {
  if (!job) return;
  console.error(`[Export Worker] Job ${job.data.exportJobId} failed:`, err.message);
  await updateExportJob(job.data.exportJobId, 'failed', {
    errorMessage: err.message,
  }).catch(console.error);
});

worker.on('error', (err) => {
  console.error('[Export Worker] Worker error:', err);
});

// ─── Resume PDF worker ────────────────────────────────────────────────────────

const resumeWorker = new Worker<ResumeExportJobData>(
  RESUME_QUEUE_NAME,
  async (job: Job<ResumeExportJobData>) => {
    const { resumeId, exportJobId } = job.data;
    console.log(`[Resume Worker] Processing job ${exportJobId} for resume ${resumeId}`);

    await updateExportJob(exportJobId, 'processing');
    await job.updateProgress(10);

    const resume = await getResume(resumeId);
    await job.updateProgress(30);

    const result = await processResumeExport(resume, exportJobId);
    await job.updateProgress(90);

    await updateExportJob(exportJobId, 'completed', {
      fileUrl: result.fileUrl,
      completedAt: new Date(),
    });
    await job.updateProgress(100);

    console.log(
      `[Resume Worker] Job ${exportJobId} completed. File: ${result.fileUrl} (${(result.sizeBytes / 1024).toFixed(1)} KB)`,
    );

    return { fileUrl: result.fileUrl };
  },
  {
    connection: redis,
    concurrency: 2,
    limiter: { max: 5, duration: 60000 },
  },
);

resumeWorker.on('failed', async (job, err) => {
  if (!job) return;
  console.error(`[Resume Worker] Job ${job.data.exportJobId} failed:`, err.message);
  await updateExportJob(job.data.exportJobId, 'failed', {
    errorMessage: err.message,
  }).catch(console.error);
});

resumeWorker.on('error', (err) => {
  console.error('[Resume Worker] Worker error:', err);
});

// ─── Graceful shutdown ─────────────────────────────────────────────────────

async function shutdown() {
  console.log('[Export Worker] Shutting down...');
  await Promise.all([worker.close(), resumeWorker.close()]);
  await redis.quit();
  await db.end();
  process.exit(0);
}

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);

console.log(`[Export Worker] Listening on queues: ${QUEUE_NAME}, ${RESUME_QUEUE_NAME}`);
console.log(`[Export Worker] Redis: ${process.env.REDIS_HOST ?? 'localhost'}:${process.env.REDIS_PORT ?? 6379}`);
