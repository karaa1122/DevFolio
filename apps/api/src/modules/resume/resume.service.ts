import {
  Injectable,
  NotFoundException,
  ConflictException,
  ForbiddenException,
  BadRequestException,
  ServiceUnavailableException,
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
import type { AtsMatchResult } from '@devfolio/shared';
import { resumeToPlainText } from './resume-text.util';

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

  /**
   * Score this resume against a job description via the ATS matching engine
   * (services/ats-engine — stateless, internal-network only).
   */
  async atsMatch(id: string, userId: string, jobDescription: string): Promise<AtsMatchResult> {
    const resume = await this.findById(id, userId);
    const resumeText = resumeToPlainText(resume.data);
    if (resumeText.trim().length < 40) {
      throw new BadRequestException('Resume has too little content to score — add some sections first');
    }

    const engineUrl = process.env.ATS_ENGINE_URL ?? 'http://localhost:8000';
    let res: Response;
    try {
      res = await fetch(`${engineUrl}/api/v1/match`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resume: resumeText, job_description: jobDescription }),
        signal: AbortSignal.timeout(15_000),
      });
    } catch {
      throw new ServiceUnavailableException('ATS matching engine is unavailable');
    }
    if (!res.ok) {
      throw new ServiceUnavailableException(`ATS matching engine returned ${res.status}`);
    }

    const r = (await res.json()) as {
      score: number;
      matched_skills: string[];
      missing_skills: string[];
      experience_gap: string;
      keyword_coverage: string[];
      semantic_similarity: number;
      summary: string;
      recommendation: string;
    };
    return {
      score: r.score,
      matchedSkills: r.matched_skills,
      missingSkills: r.missing_skills,
      experienceGap: r.experience_gap,
      keywordCoverage: r.keyword_coverage,
      semanticSimilarity: r.semantic_similarity,
      summary: r.summary,
      recommendation: r.recommendation,
    };
  }

  private async assertResumeLimit(userId: string): Promise<void> {
    const count = await this.resumeRepo.count({ where: { userId } });
    if (count >= 1) {
      throw new ForbiddenException('only 1 resume');
    }
  }
}
