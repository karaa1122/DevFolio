import {
  Injectable,
  NotFoundException,
  ConflictException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject } from '@nestjs/common';
import { Cache } from 'cache-manager';
import { v4 as uuidv4 } from 'uuid';
import { Portfolio } from '../../database/entities/portfolio.entity';
import { PortfolioSchema } from '@devfolio/shared';
import type { CreatePortfolioDto } from './dto/create-portfolio.dto';
import type { UpdatePortfolioDto } from './dto/update-portfolio.dto';

const CACHE_TTL_SECONDS = 300;

@Injectable()
export class PortfolioService {
  constructor(
    @InjectRepository(Portfolio)
    private readonly portfolioRepo: Repository<Portfolio>,
    @Inject(CACHE_MANAGER) private readonly cache: Cache,
  ) {}

  async create(userId: string, dto: CreatePortfolioDto): Promise<Portfolio> {
    const userPortfolioCount = await this.portfolioRepo.count({ where: { userId } });
    if (userPortfolioCount >= 1) throw new ConflictException('You can only have one portfolio');

    const existing = await this.portfolioRepo.findOne({ where: { slug: dto.slug } });
    if (existing) throw new ConflictException(`Slug "${dto.slug}" is already taken`);

    const portfolioData = PortfolioSchema.parse({
      id: uuidv4(),
      slug: dto.slug,
      version: 1,
      userId,
      theme: {},
      layout: { sectionsOrder: [] },
      sections: [],
      metadata: { title: dto.title },
    });

    const portfolio = this.portfolioRepo.create({ userId, slug: dto.slug, data: portfolioData });
    return this.portfolioRepo.save(portfolio);
  }

  async findByUserId(userId: string): Promise<Portfolio[]> {
    return this.portfolioRepo.find({
      where: { userId },
      order: { updatedAt: 'DESC' },
    });
  }

  async findById(id: string, userId: string): Promise<Portfolio> {
    const portfolio = await this.portfolioRepo.findOne({ where: { id } });
    if (!portfolio) throw new NotFoundException('Portfolio not found');
    if (portfolio.userId !== userId) throw new ForbiddenException('Access denied');
    return portfolio;
  }

  async findBySlug(slug: string): Promise<Portfolio> {
    const cacheKey = `portfolio:slug:${slug}`;
    const cached = await this.cache.get<Portfolio>(cacheKey);
    if (cached) return cached;

    const portfolio = await this.portfolioRepo.findOne({ where: { slug, isPublished: true } });
    if (!portfolio) throw new NotFoundException('Portfolio not found');

    await this.cache.set(cacheKey, portfolio, CACHE_TTL_SECONDS * 1000);
    return portfolio;
  }

  async update(id: string, userId: string, dto: UpdatePortfolioDto): Promise<Portfolio> {
    const portfolio = await this.findById(id, userId);

    if (dto.data) {
      const merged = PortfolioSchema.parse({
        ...portfolio.data,
        ...dto.data,
        id: portfolio.data.id,
        userId: portfolio.data.userId,
        slug: portfolio.data.slug,
        version: (portfolio.data.version ?? 1) + 1,
      });
      portfolio.data = merged;
    }

    const saved = await this.portfolioRepo.save(portfolio);
    await this.invalidateCache(portfolio.slug);
    return saved;
  }

  async publish(id: string, userId: string): Promise<Portfolio> {
    const portfolio = await this.findById(id, userId);
    portfolio.isPublished = true;
    const saved = await this.portfolioRepo.save(portfolio);
    await this.invalidateCache(portfolio.slug);
    return saved;
  }

  async unpublish(id: string, userId: string): Promise<Portfolio> {
    const portfolio = await this.findById(id, userId);
    portfolio.isPublished = false;
    const saved = await this.portfolioRepo.save(portfolio);
    await this.invalidateCache(portfolio.slug);
    return saved;
  }

  async delete(id: string, userId: string): Promise<void> {
    const portfolio = await this.findById(id, userId);
    await this.invalidateCache(portfolio.slug);
    await this.portfolioRepo.remove(portfolio);
  }

  async incrementViewCount(slug: string): Promise<void> {
    await this.portfolioRepo.increment({ slug }, 'viewCount', 1);
  }

  private async invalidateCache(slug: string): Promise<void> {
    await this.cache.del(`portfolio:slug:${slug}`);
  }
}
