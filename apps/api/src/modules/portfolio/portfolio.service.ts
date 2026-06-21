import {
  Injectable,
  NotFoundException,
  ConflictException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject } from '@nestjs/common';
import { Cache } from 'cache-manager';
import { v4 as uuidv4 } from 'uuid';
import { randomBytes } from 'crypto';
import { resolveTxt } from 'dns/promises';
import { Portfolio } from '../../database/entities/portfolio.entity';
import { PortfolioSchema } from '@devfolio/shared';
import type { DomainStatusResponse } from '@devfolio/shared';
import type { CreatePortfolioDto } from './dto/create-portfolio.dto';
import type { UpdatePortfolioDto } from './dto/update-portfolio.dto';

const CACHE_TTL_SECONDS = 300;

// Subdomain under which the ownership-verification TXT record must be published.
const DOMAIN_CHALLENGE_PREFIX = '_devfolio-challenge';

// The host users are told to CNAME their custom domain to, and the host(s) we
// refuse to let anyone claim as a "custom" domain.
const PRIMARY_HOST = (process.env.APP_PRIMARY_HOST ?? 'devfolioapp.cloud').toLowerCase();
const CUSTOM_DOMAIN_TARGET = (process.env.CUSTOM_DOMAIN_TARGET ?? PRIMARY_HOST).toLowerCase();

const RESERVED_SLUGS = new Set([
  'api',
  'admin',
  'dashboard',
  'auth',
  'login',
  'logout',
  'register',
  'signup',
  'signin',
  'profile',
  'editor',
  'settings',
  'account',
  'portfolio',
  'portfolios',
  'export',
  'exports',
  'analytics',
  'health',
  'status',
  'docs',
  'about',
  'contact',
  'help',
  'support',
  'blog',
  'terms',
  'privacy',
  'legal',
  'www',
  'mail',
  'ftp',
  'dev',
  'staging',
]);

@Injectable()
export class PortfolioService {
  constructor(
    @InjectRepository(Portfolio)
    private readonly portfolioRepo: Repository<Portfolio>,
    @Inject(CACHE_MANAGER) private readonly cache: Cache,
  ) { }

  async create(userId: string, dto: CreatePortfolioDto): Promise<Portfolio> {
    if (RESERVED_SLUGS.has(dto.slug)) throw new ConflictException(`Slug "${dto.slug}" is reserved`);

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

  async updateSlug(id: string, userId: string, newSlug: string): Promise<Portfolio> {
    if (RESERVED_SLUGS.has(newSlug)) throw new ConflictException(`Slug "${newSlug}" is reserved`);

    const existing = await this.portfolioRepo.findOne({ where: { slug: newSlug } });
    if (existing && existing.id !== id) throw new ConflictException(`Slug "${newSlug}" is already taken`);

    const portfolio = await this.findById(id, userId);
    const oldSlug = portfolio.slug;

    portfolio.slug = newSlug;
    portfolio.data = { ...portfolio.data, slug: newSlug };

    const saved = await this.portfolioRepo.save(portfolio);
    await this.invalidateCache(oldSlug);
    await this.invalidateCache(newSlug);
    return saved;
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

  // ─── Custom domains ───────────────────────────────────────────────────────

  /**
   * Attach (or re-attach) a custom domain to a portfolio. The domain is stored
   * immediately but stays unverified until the user proves ownership via DNS.
   * Changing the domain rotates the verification token and resets verification.
   */
  async setDomain(id: string, userId: string, domain: string): Promise<DomainStatusResponse> {
    const portfolio = await this.findById(id, userId);

    if (domain === PRIMARY_HOST || domain.endsWith(`.${PRIMARY_HOST}`)) {
      throw new ConflictException('That domain is reserved');
    }

    const existing = await this.portfolioRepo.findOne({ where: { customDomain: domain } });
    if (existing && existing.id !== id) {
      throw new ConflictException(`Domain "${domain}" is already in use`);
    }

    const previousDomain = portfolio.customDomain;
    const domainChanged = previousDomain !== domain;

    portfolio.customDomain = domain;
    if (domainChanged || !portfolio.domainVerificationToken) {
      portfolio.domainVerificationToken = randomBytes(16).toString('hex');
      portfolio.domainVerified = false;
      portfolio.domainVerifiedAt = null;
    }

    const saved = await this.portfolioRepo.save(portfolio);
    if (previousDomain && domainChanged) await this.invalidateDomainCache(previousDomain);
    await this.invalidateDomainCache(domain);
    return this.toDomainStatus(saved);
  }

  /**
   * Verify domain ownership by looking up the challenge TXT record and matching
   * it against the stored token. On success the domain becomes live.
   */
  async verifyDomain(id: string, userId: string): Promise<DomainStatusResponse> {
    const portfolio = await this.findById(id, userId);
    if (!portfolio.customDomain || !portfolio.domainVerificationToken) {
      throw new BadRequestException('No custom domain is configured for this portfolio');
    }

    if (portfolio.domainVerified) return this.toDomainStatus(portfolio);

    const recordName = `${DOMAIN_CHALLENGE_PREFIX}.${portfolio.customDomain}`;
    let records: string[][];
    try {
      records = await resolveTxt(recordName);
    } catch {
      throw new BadRequestException(
        `No TXT record found at ${recordName}. DNS changes can take a few minutes to propagate.`,
      );
    }

    // resolveTxt returns chunked strings per record; join chunks before matching.
    const values = records.map((chunks) => chunks.join(''));
    if (!values.includes(portfolio.domainVerificationToken)) {
      throw new BadRequestException(
        'TXT record found but it does not match the expected verification value',
      );
    }

    portfolio.domainVerified = true;
    portfolio.domainVerifiedAt = new Date();
    const saved = await this.portfolioRepo.save(portfolio);
    await this.invalidateDomainCache(saved.customDomain!);
    return this.toDomainStatus(saved);
  }

  /** Detach the custom domain and clear all verification state. */
  async removeDomain(id: string, userId: string): Promise<DomainStatusResponse> {
    const portfolio = await this.findById(id, userId);
    const previousDomain = portfolio.customDomain;

    portfolio.customDomain = null;
    portfolio.domainVerificationToken = null;
    portfolio.domainVerified = false;
    portfolio.domainVerifiedAt = null;

    const saved = await this.portfolioRepo.save(portfolio);
    if (previousDomain) await this.invalidateDomainCache(previousDomain);
    return this.toDomainStatus(saved);
  }

  /** Return the current domain status (owner view, includes DNS instructions). */
  async getDomainStatus(id: string, userId: string): Promise<DomainStatusResponse> {
    const portfolio = await this.findById(id, userId);
    return this.toDomainStatus(portfolio);
  }

  /** Public lookup used by the edge to render a portfolio served on its own domain. */
  async findByDomain(domain: string): Promise<Portfolio> {
    const normalized = domain.trim().toLowerCase().replace(/\.$/, '');
    const cacheKey = `portfolio:domain:${normalized}`;
    const cached = await this.cache.get<Portfolio>(cacheKey);
    if (cached) return cached;

    const portfolio = await this.portfolioRepo.findOne({
      where: { customDomain: normalized, domainVerified: true, isPublished: true },
    });
    if (!portfolio) throw new NotFoundException('Portfolio not found');

    await this.cache.set(cacheKey, portfolio, CACHE_TTL_SECONDS * 1000);
    return portfolio;
  }

  /**
   * Lightweight existence check used by the edge's on-demand TLS "ask" endpoint:
   * may we issue/serve a certificate for this host? True only when a verified +
   * published portfolio claims it. Returns a boolean (a `count`, not the entity)
   * to stay cheap under the per-handshake call volume.
   */
  async isDomainServable(domain: string): Promise<boolean> {
    const normalized = domain.trim().toLowerCase().replace(/\.$/, '');
    if (!normalized) return false;
    const count = await this.portfolioRepo.count({
      where: { customDomain: normalized, domainVerified: true, isPublished: true },
    });
    return count > 0;
  }

  private toDomainStatus(portfolio: Portfolio): DomainStatusResponse {
    if (!portfolio.customDomain || !portfolio.domainVerificationToken) {
      return { domain: null, verified: false, verifiedAt: null, instructions: null };
    }
    return {
      domain: portfolio.customDomain,
      verified: portfolio.domainVerified,
      verifiedAt: portfolio.domainVerifiedAt?.toISOString() ?? null,
      instructions: {
        txt: {
          type: 'TXT',
          name: `${DOMAIN_CHALLENGE_PREFIX}.${portfolio.customDomain}`,
          value: portfolio.domainVerificationToken,
        },
        cname: {
          type: 'CNAME',
          name: portfolio.customDomain,
          value: CUSTOM_DOMAIN_TARGET,
        },
      },
    };
  }

  private async invalidateCache(slug: string): Promise<void> {
    await this.cache.del(`portfolio:slug:${slug}`);
  }

  private async invalidateDomainCache(domain: string): Promise<void> {
    await this.cache.del(`portfolio:domain:${domain.trim().toLowerCase().replace(/\.$/, '')}`);
  }
}
