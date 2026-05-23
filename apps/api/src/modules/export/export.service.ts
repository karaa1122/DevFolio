import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { v4 as uuidv4 } from 'uuid';
import { ExportJob } from '../../database/entities/export-job.entity';
import { Portfolio } from '../../database/entities/portfolio.entity';
import { Resume } from '../../database/entities/resume.entity';
import { EXPORT_QUEUE, RESUME_PDF_QUEUE } from './export.processor';

@Injectable()
export class ExportService {
  constructor(
    @InjectRepository(ExportJob) private readonly exportJobRepo: Repository<ExportJob>,
    @InjectRepository(Portfolio) private readonly portfolioRepo: Repository<Portfolio>,
    @InjectRepository(Resume) private readonly resumeRepo: Repository<Resume>,
    @InjectQueue(EXPORT_QUEUE) private readonly exportQueue: Queue,
    @InjectQueue(RESUME_PDF_QUEUE) private readonly resumePdfQueue: Queue,
  ) {}

  async createExportJob(portfolioId: string, userId: string): Promise<ExportJob> {
    const portfolio = await this.portfolioRepo.findOne({ where: { id: portfolioId } });
    if (!portfolio) throw new NotFoundException('Portfolio not found');
    if (portfolio.userId !== userId) throw new NotFoundException('Portfolio not found');

    const exportJob = this.exportJobRepo.create({
      id: uuidv4(),
      portfolioId,
      resumeId: null,
      targetType: 'portfolio',
      status: 'pending',
    });
    await this.exportJobRepo.save(exportJob);

    const bullJob = await this.exportQueue.add(
      'export',
      { portfolioId, exportJobId: exportJob.id },
      { jobId: exportJob.id },
    );

    await this.exportJobRepo.update(exportJob.id, { bullJobId: String(bullJob.id) });

    return exportJob;
  }

  async createResumePdfJob(resumeId: string, userId: string): Promise<ExportJob> {
    const resume = await this.resumeRepo.findOne({ where: { id: resumeId } });
    if (!resume) {
      throw new NotFoundException(
        `Resume ${resumeId} doesn't exist in the database. It may have been deleted in another tab — try refreshing the editor.`,
      );
    }
    if (resume.userId !== userId) {
      throw new NotFoundException(
        `Resume ${resumeId} belongs to a different account. Sign out and sign back in if you recently switched accounts.`,
      );
    }

    const exportJob = this.exportJobRepo.create({
      id: uuidv4(),
      portfolioId: null,
      resumeId,
      targetType: 'resume-pdf',
      status: 'pending',
    });
    await this.exportJobRepo.save(exportJob);

    const bullJob = await this.resumePdfQueue.add(
      'export',
      { resumeId, exportJobId: exportJob.id },
      { jobId: exportJob.id },
    );

    await this.exportJobRepo.update(exportJob.id, { bullJobId: String(bullJob.id) });
    return exportJob;
  }

  async findJobById(id: string, userId: string): Promise<ExportJob> {
    const job = await this.exportJobRepo.findOne({
      where: { id },
      relations: ['portfolio', 'resume'],
    });
    if (!job) throw new NotFoundException('Export job not found');
    const ownerId = job.portfolio?.userId ?? job.resume?.userId;
    if (!ownerId || ownerId !== userId) {
      throw new NotFoundException('Export job not found');
    }
    return job;
  }

  async findJobsByPortfolio(portfolioId: string, userId: string): Promise<ExportJob[]> {
    const portfolio = await this.portfolioRepo.findOne({ where: { id: portfolioId, userId } });
    if (!portfolio) throw new NotFoundException('Portfolio not found');

    return this.exportJobRepo.find({
      where: { portfolioId },
      order: { createdAt: 'DESC' },
      take: 10,
    });
  }
}
