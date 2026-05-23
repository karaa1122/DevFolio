import {
  Controller,
  Post,
  Get,
  Param,
  UseGuards,
  Body,
  Res,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { SkipThrottle } from '@nestjs/throttler';
import { IsString } from 'class-validator';
import type { Response } from 'express';
import * as fs from 'fs/promises';
import * as path from 'path';
import JSZip from 'jszip';
import { ExportService } from './export.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { ExportJob } from '../../database/entities/export-job.entity';
import { Portfolio } from '../../database/entities/portfolio.entity';
import type { User } from '../../database/entities/user.entity';
import type { Portfolio as PortfolioData } from '@devfolio/shared';

const UPLOADS_DIR = process.env.STORAGE_LOCAL_PATH ?? path.join(process.cwd(), 'uploads');

class CreateExportJobDto {
  @IsString()
  portfolioId: string;
}

class CreateResumeExportJobDto {
  @IsString()
  resumeId: string;
}

@ApiTags('exports')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller({ path: 'exports', version: '1' })
export class ExportController {
  constructor(
    private readonly exportService: ExportService,
    @InjectRepository(ExportJob) private readonly exportJobRepo: Repository<ExportJob>,
    @InjectRepository(Portfolio) private readonly portfolioRepo: Repository<Portfolio>,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Queue a new export job for a portfolio' })
  create(@CurrentUser() user: User, @Body() dto: CreateExportJobDto) {
    return this.exportService.createExportJob(dto.portfolioId, user.id);
  }

  @Post('resume')
  @ApiOperation({ summary: 'Queue a new PDF export job for a resume' })
  createResume(@CurrentUser() user: User, @Body() dto: CreateResumeExportJobDto) {
    return this.exportService.createResumePdfJob(dto.resumeId, user.id);
  }

  @Get('portfolio/:portfolioId')
  @ApiOperation({ summary: 'List export jobs for a portfolio' })
  findByPortfolio(@CurrentUser() user: User, @Param('portfolioId') portfolioId: string) {
    return this.exportService.findJobsByPortfolio(portfolioId, user.id);
  }

  // Must be defined before :id to avoid route shadowing
  @Get('download/:filename')
  @ApiOperation({ summary: 'Download an export by filename (ZIP or PDF)' })
  async downloadByFilename(
    @CurrentUser() user: User,
    @Param('filename') filename: string,
    @Res({ passthrough: true }) res: Response,
  ) {
    const resumeMatch = filename.match(/^resume-.+-([0-9a-f-]{36})\.pdf$/);
    if (resumeMatch) {
      return this.streamResumePdf(resumeMatch[1], filename, res, user.id);
    }
    const portfolioMatch = filename.match(/portfolio-.+-([0-9a-f-]{36})\.zip$/);
    if (portfolioMatch) {
      return this.streamZipForJob(portfolioMatch[1], filename, res, user.id);
    }
    throw new NotFoundException('Invalid filename');
  }

  // Polled by the editor every ~1.2s while an export is running. At the global
  // 20 req/min limit, a single stuck export would burn the user's entire budget
  // in under 30 seconds — so it's exempt from throttling. Still JWT-guarded.
  @SkipThrottle()
  @Get(':id')
  @ApiOperation({ summary: 'Get export job status and download URL' })
  findOne(@CurrentUser() user: User, @Param('id') id: string) {
    return this.exportService.findJobById(id, user.id);
  }

  @Get(':id/download')
  @ApiOperation({ summary: 'Download an exported portfolio as a ZIP' })
  async downloadById(
    @CurrentUser() user: User,
    @Param('id') jobId: string,
    @Res({ passthrough: true }) res: Response,
  ) {
    return this.streamZipForJob(jobId, `portfolio-export-${jobId}.zip`, res, user.id);
  }

  // ─── Resume PDF streaming ────────────────────────────────────────────────

  private async streamResumePdf(
    jobId: string,
    filename: string,
    res: Response,
    requestingUserId: string,
  ) {
    const job = await this.exportJobRepo.findOne({
      where: { id: jobId },
      relations: ['resume'],
    });
    if (!job) throw new NotFoundException('Export job not found');
    if (!job.resume) throw new NotFoundException('Resume not found');
    if (job.resume.userId !== requestingUserId) throw new ForbiddenException('Access denied');

    const filePath = path.join(UPLOADS_DIR, filename);
    let buffer: Buffer;
    try {
      buffer = await fs.readFile(filePath);
    } catch {
      throw new NotFoundException('PDF file not found on disk — it may have been cleaned up');
    }

    const fileNameBase = (job.resume.data.metadata?.fileName ?? job.resume.slug)
      .replace(/\.pdf$/i, '')
      .toLowerCase()
      .replace(/[^a-z0-9-]/g, '-');
    const downloadName = `${fileNameBase}.pdf`;

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${downloadName}"`,
      'Content-Length': buffer.length,
    });
    res.end(buffer);
  }

  // ─── Shared ZIP generation ───────────────────────────────────────────────

  private async streamZipForJob(
    jobId: string,
    _zipName: string,
    res: Response,
    requestingUserId: string,
  ) {
    const job = await this.exportJobRepo.findOne({ where: { id: jobId } });
    if (!job) throw new NotFoundException('Export job not found');
    if (!job.portfolioId) throw new NotFoundException('Export job is not a portfolio export');

    const entity = await this.portfolioRepo.findOne({ where: { id: job.portfolioId } });
    if (!entity) throw new NotFoundException('Portfolio not found');
    if (entity.userId !== requestingUserId) throw new ForbiddenException('Access denied');

    const zipBuffer = await buildPortfolioZip(entity.data);

    const rawName = entity.data.metadata?.title ?? entity.data.slug ?? 'portfolio';
    const safeName = rawName
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, '');
    const zipName = `${safeName}-devfolio.zip`;

    res.set({
      'Content-Type': 'application/zip',
      'Content-Disposition': `attachment; filename="${zipName}"`,
      'Content-Length': zipBuffer.length,
    });

    res.end(zipBuffer);
  }
}

// ─── ZIP builder (no React SSR — pure HTML template) ─────────────────────

async function buildPortfolioZip(portfolio: PortfolioData): Promise<Buffer> {
  const zip = new JSZip();

  zip.file('index.html', buildHtml(portfolio));
  zip.file('styles.css', buildCss(portfolio));
  zip.file(
    'README.md',
    `# ${portfolio.metadata?.title ?? portfolio.slug} — Portfolio Export\n\n` +
      `Generated by DevFolio on ${new Date().toISOString()}\n\n` +
      `## Deploy\n\n` +
      `- **Netlify**: drag-and-drop this folder\n` +
      `- **GitHub Pages**: push contents to a \`gh-pages\` branch\n` +
      `- **Any host**: copy \`index.html\` + \`styles.css\` to your web root\n`,
  );

  return zip.generateAsync({
    type: 'nodebuffer',
    compression: 'DEFLATE',
    compressionOptions: { level: 6 },
  });
}

function buildHtml(p: PortfolioData): string {
  const title = esc(p.metadata?.title ?? p.slug);
  const desc = esc(p.metadata?.description ?? '');
  const fontMap: Record<string, string> = {
    inter: 'Inter',
    roboto: 'Roboto',
    poppins: 'Poppins',
    'fira-code': 'Fira+Code',
    'jetbrains-mono': 'JetBrains+Mono',
  };
  const font = p.theme?.font ?? 'inter';
  const fontParam = `family=${fontMap[font] ?? 'Inter'}:wght@400;500;600;700;800`;
  const sections = (p.sections ?? []).filter((s) => s.visible !== false);

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${title}</title>
  ${desc ? `<meta name="description" content="${desc}" />` : ''}
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link href="https://fonts.googleapis.com/css2?${fontParam}&display=swap" rel="stylesheet" />
  <link rel="stylesheet" href="./styles.css" />
</head>
<body>
${sections.map((s) => renderSection(s)).join('\n')}
</body>
</html>`;
}

function renderSection(s: PortfolioData['sections'][number]): string {
  const d = s.data as any;
  switch (s.type) {
    case 'hero':
      return `
  <section class="hero">
    <h1>${esc(d.name ?? '')}</h1>
    <p class="hero-title">${esc(d.title ?? '')}</p>
    ${d.subtitle ? `<p class="hero-sub">${esc(d.subtitle)}</p>` : ''}
    ${d.bio ? `<p class="bio">${esc(d.bio)}</p>` : ''}
    ${d.location ? `<p class="location">${esc(d.location)}</p>` : ''}
    ${d.availableForWork ? `<span class="badge">Available for work</span>` : ''}
  </section>`;

    case 'about':
      return `
  <section class="about">
    <h2>${esc(d.heading ?? 'About')}</h2>
    <p>${esc(d.bio ?? '')}</p>
  </section>`;

    case 'experience':
      return `
  <section class="experience">
    <h2>${esc(d.heading ?? 'Experience')}</h2>
    ${(d.items ?? [])
      .map(
        (i: any) => `
    <div class="item">
      <div class="item-header">
        <strong>${esc(i.role)}</strong> at ${esc(i.company)}
        <span class="dates">${esc(i.startDate)} – ${i.current ? 'Present' : esc(i.endDate ?? '')}</span>
      </div>
      ${i.description ? `<p>${esc(i.description)}</p>` : ''}
    </div>`,
      )
      .join('')}
  </section>`;

    case 'education':
      return `
  <section class="education">
    <h2>${esc(d.heading ?? 'Education')}</h2>
    ${(d.items ?? [])
      .map(
        (i: any) => `
    <div class="item">
      <strong>${esc(i.degree)}</strong> — ${esc(i.institution)}
      ${i.field ? `<span>${esc(i.field)}</span>` : ''}
      <span class="dates">${esc(i.startDate)} – ${i.current ? 'Present' : esc(i.endDate ?? '')}</span>
    </div>`,
      )
      .join('')}
  </section>`;

    case 'projects':
      return `
  <section class="projects">
    <h2>${esc(d.heading ?? 'Projects')}</h2>
    <div class="grid">
    ${(d.items ?? [])
      .map(
        (i: any) => `
      <div class="card">
        <h3>${esc(i.title)}</h3>
        <p>${esc(i.description ?? '')}</p>
        ${(i.tags ?? []).length ? `<div class="tags">${(i.tags as string[]).map((t) => `<span>${esc(t)}</span>`).join('')}</div>` : ''}
        <div class="links">
          ${i.liveUrl ? `<a href="${esc(i.liveUrl)}" target="_blank">Live ↗</a>` : ''}
          ${i.repoUrl ? `<a href="${esc(i.repoUrl)}" target="_blank">Code ↗</a>` : ''}
        </div>
      </div>`,
      )
      .join('')}
    </div>
  </section>`;

    case 'skills':
      return `
  <section class="skills">
    <h2>${esc(d.heading ?? 'Skills')}</h2>
    <div class="tags">
      ${(d.items ?? []).map((i: any) => `<span>${esc(i.name)}</span>`).join('')}
    </div>
  </section>`;

    case 'contact':
      return `
  <section class="contact">
    <h2>${esc(d.heading ?? 'Contact')}</h2>
    ${d.email ? `<p><a href="mailto:${esc(d.email)}">${esc(d.email)}</a></p>` : ''}
    ${d.location ? `<p>${esc(d.location)}</p>` : ''}
    <div class="socials">
      ${d.socials?.github ? `<a href="${esc(d.socials.github)}" target="_blank">GitHub</a>` : ''}
      ${d.socials?.linkedin ? `<a href="${esc(d.socials.linkedin)}" target="_blank">LinkedIn</a>` : ''}
      ${d.socials?.twitter ? `<a href="${esc(d.socials.twitter)}" target="_blank">Twitter</a>` : ''}
    </div>
  </section>`;

    default:
      return '';
  }
}

function buildCss(p: PortfolioData): string {
  const c = p.theme?.colors ?? {};
  const bg = c.background ?? '#0f172a';
  const fg = c.foreground ?? '#f1f5f9';
  const primary = c.primary ?? '#7c3aed';
  const accent = c.accent ?? '#a78bfa';
  const fontMap: Record<string, string> = {
    inter: 'Inter',
    roboto: 'Roboto',
    poppins: 'Poppins',
    'fira-code': "'Fira Code'",
    'jetbrains-mono': "'JetBrains Mono'",
  };
  const fontFamily = fontMap[p.theme?.font ?? 'inter'] ?? 'Inter';

  return `*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
html { scroll-behavior: smooth; }
body { font-family: ${fontFamily}, -apple-system, sans-serif; background: ${bg}; color: ${fg}; line-height: 1.6; -webkit-font-smoothing: antialiased; }
a { color: ${primary}; text-decoration: none; }
a:hover { text-decoration: underline; }
section { max-width: 860px; margin: 0 auto; padding: 4rem 1.5rem; border-bottom: 1px solid ${primary}22; }
h1 { font-size: 2.8rem; font-weight: 800; line-height: 1.1; }
h2 { font-size: 1.6rem; font-weight: 700; margin-bottom: 1.5rem; color: ${accent}; }
h3 { font-size: 1.1rem; font-weight: 600; margin-bottom: 0.5rem; }
.hero { padding-top: 6rem; }
.hero-title { font-size: 1.4rem; color: ${primary}; margin-top: 0.5rem; }
.hero-sub { font-size: 1rem; color: ${fg}99; margin-top: 0.25rem; }
.bio { max-width: 600px; margin-top: 1.5rem; color: ${fg}cc; }
.location { margin-top: 0.5rem; color: ${fg}77; font-size: 0.9rem; }
.badge { display: inline-block; margin-top: 1rem; background: ${primary}33; color: ${primary}; border: 1px solid ${primary}66; padding: 0.3rem 0.8rem; border-radius: 9999px; font-size: 0.8rem; }
.item { margin-bottom: 1.5rem; padding-bottom: 1.5rem; border-bottom: 1px solid ${fg}11; }
.item-header { display: flex; justify-content: space-between; align-items: baseline; flex-wrap: wrap; gap: 0.5rem; margin-bottom: 0.5rem; }
.dates { font-size: 0.85rem; color: ${fg}66; }
.grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 1.25rem; }
.card { background: ${fg}08; border: 1px solid ${fg}15; border-radius: 0.75rem; padding: 1.25rem; }
.tags { display: flex; flex-wrap: wrap; gap: 0.5rem; margin-top: 0.75rem; }
.tags span { background: ${primary}22; color: ${primary}; border-radius: 9999px; padding: 0.2rem 0.6rem; font-size: 0.78rem; }
.links { display: flex; gap: 1rem; margin-top: 1rem; font-size: 0.85rem; }
.socials { display: flex; gap: 1.5rem; margin-top: 1rem; }
@media (max-width: 600px) { h1 { font-size: 2rem; } .grid { grid-template-columns: 1fr; } }`;
}

function esc(s: string): string {
  return (s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}
