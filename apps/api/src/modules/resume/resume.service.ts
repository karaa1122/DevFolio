import {
  Injectable,
  NotFoundException,
  ConflictException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { Resume } from '../../database/entities/resume.entity';
import {
  ResumeSchema,
  type Resume as ResumeData,
  type ResumeTemplateId,
} from '@devfolio/shared';
import type { CreateResumeDto } from './dto/create-resume.dto';
import type { UpdateResumeDto } from './dto/update-resume.dto';
import type { DuplicateResumeDto } from './dto/duplicate-resume.dto';

@Injectable()
export class ResumeService {
  constructor(
    @InjectRepository(Resume)
    private readonly resumeRepo: Repository<Resume>,
  ) {}

  async create(userId: string, dto: CreateResumeDto): Promise<Resume> {
    await this.assertResumeLimit(userId);
    await this.assertSlugFree(userId, dto.slug);

    const resumeData = ResumeSchema.parse({
      id: uuidv4(),
      slug: dto.slug,
      version: 1,
      userId,
      template: (dto.template ?? 'classic') as ResumeTemplateId,
      theme: {},
      page: {},
      density: 'normal',
      layout: { sectionsOrder: [] },
      sections: [],
      metadata: { title: dto.title, targetRole: dto.targetRole },
    });

    const resume = this.resumeRepo.create({ userId, slug: dto.slug, data: resumeData });
    return this.resumeRepo.save(resume);
  }

  async findByUserId(userId: string): Promise<Resume[]> {
    return this.resumeRepo.find({
      where: { userId },
      order: { updatedAt: 'DESC' },
    });
  }

  async findById(id: string, userId: string): Promise<Resume> {
    const resume = await this.resumeRepo.findOne({ where: { id } });
    if (!resume) throw new NotFoundException('Resume not found');
    if (resume.userId !== userId) throw new ForbiddenException('Access denied');
    return resume;
  }

  async update(id: string, userId: string, dto: UpdateResumeDto): Promise<Resume> {
    const resume = await this.findById(id, userId);

    if (dto.data) {
      const merged = ResumeSchema.parse({
        ...resume.data,
        ...dto.data,
        id: resume.data.id,
        userId: resume.data.userId,
        slug: resume.data.slug,
        version: (resume.data.version ?? 1) + 1,
      });
      resume.data = merged;
    }

    return this.resumeRepo.save(resume);
  }

  async updateSlug(id: string, userId: string, newSlug: string): Promise<Resume> {
    const resume = await this.findById(id, userId);
    if (resume.slug === newSlug) return resume;
    await this.assertSlugFree(userId, newSlug);

    resume.slug = newSlug;
    resume.data = { ...resume.data, slug: newSlug };
    return this.resumeRepo.save(resume);
  }

  async duplicate(id: string, userId: string, dto: DuplicateResumeDto): Promise<Resume> {
    await this.assertResumeLimit(userId);
    const source = await this.findById(id, userId);
    await this.assertSlugFree(userId, dto.slug);

    const cloned: ResumeData = ResumeSchema.parse({
      ...source.data,
      id: uuidv4(),
      slug: dto.slug,
      version: 1,
      metadata: {
        ...source.data.metadata,
        title: dto.title ?? source.data.metadata?.title,
        targetRole: dto.targetRole ?? source.data.metadata?.targetRole,
      },
    });

    const resume = this.resumeRepo.create({ userId, slug: dto.slug, data: cloned });
    return this.resumeRepo.save(resume);
  }

  async delete(id: string, userId: string): Promise<void> {
    const resume = await this.findById(id, userId);
    await this.resumeRepo.remove(resume);
  }

  // ─── helpers ─────────────────────────────────────────────────────────────

  private async assertSlugFree(userId: string, slug: string): Promise<void> {
    const existing = await this.resumeRepo.findOne({ where: { userId, slug } });
    if (existing) throw new ConflictException(`Slug "${slug}" is already taken`);
  }

  private async assertResumeLimit(userId: string): Promise<void> {
    const count = await this.resumeRepo.count({ where: { userId } });
    if (count >= 1) {
      throw new ForbiddenException('only 1 resume');
    }
  }
}
