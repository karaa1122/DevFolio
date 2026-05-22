import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { v4 as uuidv4 } from 'uuid';
import { randomBytes } from 'crypto';
import { Resume as ResumeEntity } from '../../database/entities/resume.entity';
import { Portfolio } from '../../database/entities/portfolio.entity';
import { ExportJob } from '../../database/entities/export-job.entity';
import { ResumeSchema } from '@devfolio/shared';
import type { Resume, ResumeSection } from '@devfolio/shared';
import type { CreateResumeDto } from './dto/create-resume.dto';
import type { UpdateResumeDto } from './dto/update-resume.dto';

export const RESUME_EXPORT_QUEUE = 'export-resume';

@Injectable()
export class ResumeService {
  constructor(
    @InjectRepository(ResumeEntity) private readonly resumeRepo: Repository<ResumeEntity>,
    @InjectRepository(Portfolio) private readonly portfolioRepo: Repository<Portfolio>,
    @InjectRepository(ExportJob) private readonly exportJobRepo: Repository<ExportJob>,
    @InjectQueue(RESUME_EXPORT_QUEUE) private readonly resumeQueue: Queue,
  ) {}

  async create(userId: string, dto: CreateResumeDto): Promise<ResumeEntity> {
    const existing = await this.resumeRepo.count({ where: { userId } });
    if (existing >= 1) throw new ConflictException('Only one resume is allowed per account. Edit or delete your existing resume.');

    const sections: ResumeSection[] = [];
    const sectionsOrder: string[] = [];

    if (dto.portfolioId) {
      const portfolio = await this.portfolioRepo.findOne({ where: { id: dto.portfolioId } });
      if (!portfolio || portfolio.userId !== userId) {
        throw new NotFoundException('Portfolio not found');
      }
      this.importFromPortfolio(portfolio.data.sections, sections, sectionsOrder);
    } else {
      const contactId = uuidv4();
      const summaryId = uuidv4();
      const expId = uuidv4();
      const eduId = uuidv4();
      const skillsId = uuidv4();
      sections.push(
        { id: contactId, type: 'contact', visible: true, data: { name: '', email: '', phone: '', location: '', website: '', linkedin: '', github: '', photoShape: 'circle' as const, photoPosition: 'right' as const, nameAlign: 'center' as const } },
        { id: summaryId, type: 'summary', visible: true, data: { heading: 'Professional Summary', text: '' } },
        { id: expId, type: 'experience', visible: true, data: { heading: 'Experience', items: [] } },
        { id: eduId, type: 'education', visible: true, data: { heading: 'Education', items: [] } },
        { id: skillsId, type: 'skills', visible: true, data: { heading: 'Skills', items: [] } },
      );
      sectionsOrder.push(contactId, summaryId, expId, eduId, skillsId);
    }

    const id = uuidv4();
    const data: Resume = ResumeSchema.parse({
      id,
      userId,
      portfolioId: dto.portfolioId,
      title: dto.title ?? 'My Resume',
      theme: {},
      layout: { sectionsOrder },
      sections,
      metadata: {},
    });

    const resume = this.resumeRepo.create({ id, userId, portfolioId: dto.portfolioId, data });
    return this.resumeRepo.save(resume);
  }

  async findByUserId(userId: string): Promise<ResumeEntity[]> {
    return this.resumeRepo.find({ where: { userId }, order: { updatedAt: 'DESC' } });
  }

  async findById(id: string, userId: string): Promise<ResumeEntity> {
    const resume = await this.resumeRepo.findOne({ where: { id } });
    if (!resume) throw new NotFoundException('Resume not found');
    if (resume.userId !== userId) throw new ForbiddenException('Access denied');
    return resume;
  }

  async update(id: string, userId: string, dto: UpdateResumeDto): Promise<ResumeEntity> {
    const resume = await this.findById(id, userId);
    if (dto.data) {
      const merged = ResumeSchema.parse({
        ...resume.data,
        ...dto.data,
        id: resume.data.id,
        userId: resume.data.userId,
        version: (resume.data.version ?? 1) + 1,
      });
      resume.data = merged;
    }
    return this.resumeRepo.save(resume);
  }

  async delete(id: string, userId: string): Promise<void> {
    const resume = await this.findById(id, userId);
    await this.resumeRepo.remove(resume);
  }

  async createExportJob(id: string, userId: string): Promise<ExportJob> {
    const resume = await this.findById(id, userId);

    const jobId = uuidv4();
    const exportJob = this.exportJobRepo.create({
      id: jobId,
      resumeId: resume.id,
      portfolioId: null as unknown as string,
      type: 'resume',
      status: 'pending',
    });
    await this.exportJobRepo.save(exportJob);

    const bullJob = await this.resumeQueue.add(
      'export-resume',
      { resumeId: resume.id, exportJobId: jobId },
      { jobId },
    );
    await this.exportJobRepo.update(jobId, { bullJobId: String(bullJob.id) });

    return exportJob;
  }

  async findExportJobs(resumeId: string, userId: string): Promise<ExportJob[]> {
    await this.findById(resumeId, userId);
    return this.exportJobRepo.find({
      where: { resumeId },
      order: { createdAt: 'DESC' },
      take: 10,
    });
  }

  private importFromPortfolio(
    portfolioSections: import('@devfolio/shared').Section[],
    out: ResumeSection[],
    order: string[],
  ): void {
    const contactId = uuidv4();
    out.push({ id: contactId, type: 'contact', visible: true, data: { name: '', email: '', phone: '', location: '', photoShape: 'circle' as const, photoPosition: 'right' as const, nameAlign: 'center' as const } });
    order.push(contactId);

    const summaryId = uuidv4();
    out.push({ id: summaryId, type: 'summary', visible: true, data: { heading: 'Professional Summary', text: '' } });
    order.push(summaryId);

    for (const section of portfolioSections) {
      const id = uuidv4();
      if (section.type === 'experience') {
        out.push({ id, type: 'experience', visible: true, data: { heading: section.data.heading ?? 'Experience', items: section.data.items ?? [] } });
        order.push(id);
      } else if (section.type === 'education') {
        out.push({ id, type: 'education', visible: true, data: { heading: section.data.heading ?? 'Education', items: section.data.items ?? [] } });
        order.push(id);
      } else if (section.type === 'skills') {
        out.push({ id, type: 'skills', visible: true, data: { heading: section.data.heading ?? 'Skills', items: section.data.items ?? [] } });
        order.push(id);
      } else if (section.type === 'projects') {
        out.push({ id, type: 'projects', visible: true, data: { heading: section.data.heading ?? 'Projects', items: section.data.items ?? [] } });
        order.push(id);
      }
    }
  }
}
