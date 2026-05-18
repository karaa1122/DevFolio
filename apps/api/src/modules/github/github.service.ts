import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../database/entities/user.entity';
import { Portfolio } from '../../database/entities/portfolio.entity';
import type { GitHubRepo } from '@devfolio/shared';

@Injectable()
export class GithubService {
  constructor(
    @InjectRepository(User) private readonly userRepo: Repository<User>,
    @InjectRepository(Portfolio) private readonly portfolioRepo: Repository<Portfolio>,
  ) {}

  async fetchUserRepos(userId: string): Promise<GitHubRepo[]> {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user?.githubAccessToken) {
      throw new UnauthorizedException('GitHub account not connected');
    }

    const response = await fetch(
      'https://api.github.com/user/repos?sort=updated&per_page=50&type=owner',
      {
        headers: {
          Authorization: `token ${user.githubAccessToken}`,
          Accept: 'application/vnd.github.v3+json',
        },
      },
    );

    if (!response.ok) {
      throw new BadRequestException('Failed to fetch GitHub repositories');
    }

    const repos = (await response.json()) as Array<{
      id: number;
      name: string;
      full_name: string;
      description: string | null;
      html_url: string;
      homepage: string | null;
      stargazers_count: number;
      forks_count: number;
      language: string | null;
      topics: string[];
      private: boolean;
      updated_at: string;
    }>;

    return repos.map((r) => ({
      id: r.id,
      name: r.name,
      fullName: r.full_name,
      description: r.description ?? undefined,
      url: r.html_url,
      homepage: r.homepage ?? undefined,
      stars: r.stargazers_count,
      forks: r.forks_count,
      language: r.language ?? undefined,
      topics: r.topics ?? [],
      isPrivate: r.private,
      updatedAt: r.updated_at,
    }));
  }

  async syncReposToPortfolio(
    userId: string,
    portfolioId: string,
    repoIds: number[],
  ): Promise<Portfolio> {
    const repos = await this.fetchUserRepos(userId);
    const selectedRepos = repos.filter((r) => repoIds.includes(r.id));

    const portfolio = await this.portfolioRepo.findOne({
      where: { id: portfolioId, userId },
    });
    if (!portfolio) throw new BadRequestException('Portfolio not found');

    const projectsSection = portfolio.data.sections.find((s) => s.type === 'projects');
    const importedProjects = selectedRepos.map((repo) => ({
      id: `github-${repo.id}`,
      title: repo.name,
      description: repo.description ?? '',
      tags: [repo.language, ...repo.topics].filter(Boolean) as string[],
      liveUrl: repo.homepage ?? undefined,
      repoUrl: repo.url,
      featured: false,
      status: 'completed' as const,
    }));

    if (projectsSection && projectsSection.type === 'projects') {
      const existingIds = new Set(projectsSection.data.items.map((p) => p.id));
      const newProjects = importedProjects.filter((p) => !existingIds.has(p.id));
      projectsSection.data.items.push(...newProjects);
    } else {
      const { v4: uuidv4 } = await import('uuid');
      portfolio.data.sections.push({
        id: uuidv4(),
        type: 'projects',
        visible: true,
        data: {
          heading: 'Projects',
          items: importedProjects,
          layout: 'grid',
          showFeaturedOnly: false,
        },
      });
      portfolio.data.layout.sectionsOrder.push(portfolio.data.sections.at(-1)!.id);
    }

    return this.portfolioRepo.save(portfolio);
  }

  async getConnectionStatus(userId: string): Promise<{
    connected: boolean;
    username?: string;
  }> {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    return {
      connected: !!user?.githubAccessToken,
      username: user?.githubUsername,
    };
  }

  async disconnect(userId: string): Promise<void> {
    await this.userRepo.update(userId, {
      githubAccessToken: null as unknown as string,
      githubId: null as unknown as string,
      githubUsername: null as unknown as string,
    });
  }
}
