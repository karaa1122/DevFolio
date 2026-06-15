import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { PortfolioService } from './portfolio.service';
import { Portfolio } from '../../database/entities/portfolio.entity';

const USER_UUID = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11';
const PORTFOLIO_UUID = 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12';
const OTHER_USER_UUID = 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13';
const DATA_UUID = 'e0eebc99-9c0b-4ef8-bb6d-6bb9bd380a15';

const mockPortfolioEntity = (overrides: Partial<Portfolio> = {}): Portfolio => ({
  id: PORTFOLIO_UUID,
  slug: 'test-user',
  userId: USER_UUID,
  data: {
    id: DATA_UUID,
    slug: 'test-user',
    version: 1,
    theme: { colors: {} as any, font: 'inter', radius: 'md', darkMode: true, spacing: 'normal' },
    layout: { sectionsOrder: [] },
    sections: [],
    metadata: { title: 'Test Portfolio' },
  } as any,
  isPublished: false,
  viewCount: 0,
  customDomain: null,
  domainVerified: false,
  domainVerificationToken: null,
  domainVerifiedAt: null,
  createdAt: new Date(),
  updatedAt: new Date(),
  user: undefined as any,
  exportJobs: [],
  ...overrides,
});

describe('PortfolioService', () => {
  let service: PortfolioService;

  const portfolioRepo = {
    count: jest.fn(),
    findOne: jest.fn(),
    find: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    remove: jest.fn(),
    increment: jest.fn(),
  };

  const cache = {
    get: jest.fn().mockResolvedValue(null),
    set: jest.fn().mockResolvedValue(undefined),
    del: jest.fn().mockResolvedValue(undefined),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PortfolioService,
        { provide: getRepositoryToken(Portfolio), useValue: portfolioRepo },
        { provide: CACHE_MANAGER, useValue: cache },
      ],
    }).compile();

    service = module.get<PortfolioService>(PortfolioService);
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('creates and returns a portfolio', async () => {
      portfolioRepo.count.mockResolvedValue(0);
      portfolioRepo.findOne.mockResolvedValue(null);
      const entity = mockPortfolioEntity();
      portfolioRepo.create.mockReturnValue(entity);
      portfolioRepo.save.mockResolvedValue(entity);

      const result = await service.create(USER_UUID, { slug: 'test-user' });

      expect(result.slug).toBe('test-user');
    });

    it('enforces 1-portfolio-per-user limit', async () => {
      portfolioRepo.count.mockResolvedValue(1);

      await expect(service.create(USER_UUID, { slug: 'second-portfolio' })).rejects.toThrow(
        ConflictException,
      );
    });

    it('throws ConflictException when slug is already taken', async () => {
      portfolioRepo.count.mockResolvedValue(0);
      portfolioRepo.findOne.mockResolvedValue(mockPortfolioEntity());

      await expect(service.create(USER_UUID, { slug: 'taken-slug' })).rejects.toThrow(
        ConflictException,
      );
    });
  });

  describe('findById', () => {
    it('returns the portfolio when found and user matches', async () => {
      portfolioRepo.findOne.mockResolvedValue(mockPortfolioEntity());

      const result = await service.findById(PORTFOLIO_UUID, USER_UUID);

      expect(result.id).toBe(PORTFOLIO_UUID);
    });

    it('throws NotFoundException when portfolio does not exist', async () => {
      portfolioRepo.findOne.mockResolvedValue(null);

      await expect(service.findById(PORTFOLIO_UUID, USER_UUID)).rejects.toThrow(NotFoundException);
    });

    it('throws ForbiddenException when portfolio belongs to another user', async () => {
      portfolioRepo.findOne.mockResolvedValue(mockPortfolioEntity({ userId: OTHER_USER_UUID }));

      await expect(service.findById(PORTFOLIO_UUID, USER_UUID)).rejects.toThrow(
        ForbiddenException,
      );
    });
  });

  describe('findBySlug', () => {
    it('returns cached portfolio when available', async () => {
      const cached = mockPortfolioEntity({ isPublished: true });
      cache.get.mockResolvedValue(cached);

      const result = await service.findBySlug('test-user');

      expect(result).toBe(cached);
      expect(portfolioRepo.findOne).not.toHaveBeenCalled();
    });

    it('throws NotFoundException for unpublished or missing portfolio', async () => {
      cache.get.mockResolvedValue(null);
      portfolioRepo.findOne.mockResolvedValue(null);

      await expect(service.findBySlug('missing')).rejects.toThrow(NotFoundException);
    });
  });

  describe('publish / unpublish', () => {
    it('sets isPublished to true', async () => {
      const entity = mockPortfolioEntity();
      portfolioRepo.findOne.mockResolvedValue(entity);
      portfolioRepo.save.mockResolvedValue({ ...entity, isPublished: true });

      const result = await service.publish(PORTFOLIO_UUID, USER_UUID);

      expect(result.isPublished).toBe(true);
    });

    it('sets isPublished to false', async () => {
      const entity = mockPortfolioEntity({ isPublished: true });
      portfolioRepo.findOne.mockResolvedValue(entity);
      portfolioRepo.save.mockResolvedValue({ ...entity, isPublished: false });

      const result = await service.unpublish(PORTFOLIO_UUID, USER_UUID);

      expect(result.isPublished).toBe(false);
    });
  });
});
