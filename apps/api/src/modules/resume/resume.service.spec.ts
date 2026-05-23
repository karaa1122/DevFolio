import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ResumeService } from './resume.service';
import { Resume } from '../../database/entities/resume.entity';

const USER_UUID = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11';
const OTHER_USER_UUID = 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13';
const RESUME_UUID = 'd0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14';
const DATA_UUID = 'e0eebc99-9c0b-4ef8-bb6d-6bb9bd380a15';

const mockResumeEntity = (overrides: Partial<Resume> = {}): Resume => ({
  id: RESUME_UUID,
  slug: 'backend-engineer',
  userId: USER_UUID,
  data: {
    id: DATA_UUID,
    slug: 'backend-engineer',
    userId: USER_UUID,
    version: 1,
    template: 'classic',
    theme: {} as any,
    page: { format: 'A4', margin: 'normal' },
    density: 'normal',
    layout: { sectionsOrder: [] },
    sections: [],
    metadata: { title: 'Backend Engineer 2026' },
  } as any,
  createdAt: new Date(),
  updatedAt: new Date(),
  user: undefined as any,
  exportJobs: [],
  ...overrides,
});

describe('ResumeService', () => {
  let service: ResumeService;

  const resumeRepo = {
    count: jest.fn(),
    findOne: jest.fn(),
    find: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ResumeService,
        { provide: getRepositoryToken(Resume), useValue: resumeRepo },
      ],
    }).compile();

    service = module.get<ResumeService>(ResumeService);
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('creates and returns a resume', async () => {
      resumeRepo.findOne.mockResolvedValue(null);
      const entity = mockResumeEntity();
      resumeRepo.create.mockReturnValue(entity);
      resumeRepo.save.mockResolvedValue(entity);

      const result = await service.create(USER_UUID, { slug: 'backend-engineer' });

      expect(result.slug).toBe('backend-engineer');
    });

    it('allows multiple resumes per user (no 1-per-user limit)', async () => {
      resumeRepo.findOne.mockResolvedValue(null);
      const entity = mockResumeEntity({ slug: 'frontend-2026' });
      resumeRepo.create.mockReturnValue(entity);
      resumeRepo.save.mockResolvedValue(entity);

      const result = await service.create(USER_UUID, { slug: 'frontend-2026' });

      expect(result.slug).toBe('frontend-2026');
    });

    it('throws ConflictException when slug is already taken by the same user', async () => {
      resumeRepo.findOne.mockResolvedValue(mockResumeEntity());

      await expect(service.create(USER_UUID, { slug: 'taken-slug' })).rejects.toThrow(
        ConflictException,
      );
    });
  });

  describe('findById', () => {
    it('returns the resume when found and user matches', async () => {
      resumeRepo.findOne.mockResolvedValue(mockResumeEntity());

      const result = await service.findById(RESUME_UUID, USER_UUID);

      expect(result.id).toBe(RESUME_UUID);
    });

    it('throws NotFoundException when resume does not exist', async () => {
      resumeRepo.findOne.mockResolvedValue(null);

      await expect(service.findById(RESUME_UUID, USER_UUID)).rejects.toThrow(NotFoundException);
    });

    it('throws ForbiddenException when resume belongs to another user', async () => {
      resumeRepo.findOne.mockResolvedValue(mockResumeEntity({ userId: OTHER_USER_UUID }));

      await expect(service.findById(RESUME_UUID, USER_UUID)).rejects.toThrow(ForbiddenException);
    });
  });

  describe('update', () => {
    it('merges data and bumps version', async () => {
      const entity = mockResumeEntity();
      resumeRepo.findOne.mockResolvedValue(entity);
      resumeRepo.save.mockImplementation((x: Resume) => Promise.resolve(x));

      const result = await service.update(RESUME_UUID, USER_UUID, {
        data: { density: 'compact' } as any,
      });

      expect(result.data.density).toBe('compact');
      expect(result.data.version).toBe(2);
    });
  });

  describe('updateSlug', () => {
    it('returns unchanged resume when slug is identical', async () => {
      const entity = mockResumeEntity();
      resumeRepo.findOne.mockResolvedValue(entity);

      const result = await service.updateSlug(RESUME_UUID, USER_UUID, 'backend-engineer');

      expect(result.slug).toBe('backend-engineer');
      expect(resumeRepo.save).not.toHaveBeenCalled();
    });

    it('throws ConflictException when the new slug is taken', async () => {
      // First findOne = findById (entity exists). Second = slug collision.
      resumeRepo.findOne
        .mockResolvedValueOnce(mockResumeEntity())
        .mockResolvedValueOnce(mockResumeEntity({ id: 'other-id', slug: 'new-slug' }));

      await expect(service.updateSlug(RESUME_UUID, USER_UUID, 'new-slug')).rejects.toThrow(
        ConflictException,
      );
    });
  });

  describe('duplicate', () => {
    it('clones a resume with a new slug and fresh version', async () => {
      const source = mockResumeEntity();
      resumeRepo.findOne
        .mockResolvedValueOnce(source) // findById
        .mockResolvedValueOnce(null); // slug check
      resumeRepo.create.mockImplementation((x: any) => x);
      resumeRepo.save.mockImplementation((x: any) => Promise.resolve({ ...x, id: 'new-id' }));

      const result = await service.duplicate(RESUME_UUID, USER_UUID, {
        slug: 'backend-engineer-acme',
        title: 'Backend Engineer — Acme',
      });

      expect(result.slug).toBe('backend-engineer-acme');
      expect(result.data.id).not.toBe(source.data.id);
      expect(result.data.version).toBe(1);
      expect(result.data.metadata.title).toBe('Backend Engineer — Acme');
    });
  });

  describe('findByUserId', () => {
    it('returns the user resumes ordered by updatedAt DESC', async () => {
      const list = [mockResumeEntity(), mockResumeEntity({ id: 'other-id', slug: 'frontend' })];
      resumeRepo.find.mockResolvedValue(list);

      const result = await service.findByUserId(USER_UUID);

      expect(result).toHaveLength(2);
      expect(resumeRepo.find).toHaveBeenCalledWith({
        where: { userId: USER_UUID },
        order: { updatedAt: 'DESC' },
      });
    });
  });
});
