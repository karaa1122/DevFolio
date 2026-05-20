import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { createHash } from 'crypto';
import type { Request } from 'express';
import { AnalyticsEvent } from '../../database/entities/analytics-event.entity';
import { Portfolio } from '../../database/entities/portfolio.entity';
import type { TrackEventDto } from './dto/track-event.dto';
import type { PortfolioAnalytics } from '@devfolio/shared';

@Injectable()
export class AnalyticsService {
  constructor(
    @InjectRepository(AnalyticsEvent)
    private readonly eventRepo: Repository<AnalyticsEvent>,
    @InjectRepository(Portfolio)
    private readonly portfolioRepo: Repository<Portfolio>,
    private readonly dataSource: DataSource,
  ) {}

  async track(dto: TrackEventDto, req: Request): Promise<void> {
    // Silently drop events for portfolios that don't exist or aren't published.
    // Prevents phantom-portfolio event spam from polluting the DB.
    const exists = await this.portfolioRepo.existsBy({
      id: dto.portfolioId,
      isPublished: true,
    });
    if (!exists) return;

    const rawIp = req.ip ?? '';
    // One-way hash — preserves uniqueness for visitor counting without storing PII
    const hashedIp = createHash('sha256')
      .update(rawIp + (process.env.IP_HASH_SALT ?? 'devfolio-ip-salt'))
      .digest('hex')
      .slice(0, 16);

    const event = this.eventRepo.create({
      portfolioId: dto.portfolioId,
      type: dto.type,
      sectionId: dto.sectionId,
      referrer: req.headers['referer'],
      userAgent: (req.headers['user-agent'] ?? '').slice(0, 200),
      ip: hashedIp,
      metadata: dto.metadata,
    });
    await this.eventRepo.save(event);
  }

  async getPortfolioAnalytics(portfolioId: string, days = 30): Promise<PortfolioAnalytics> {
    const since = new Date();
    since.setDate(since.getDate() - days);

    // All aggregation is done in PostgreSQL — never loads raw rows into Node memory.
    const [totalViewsRow, uniqueVisitorsRow, topSectionsRows, viewsByDayRows] = await Promise.all([
      // Total page_view events
      this.dataSource.query<[{ count: string }]>(
        `SELECT COUNT(*) AS count
         FROM analytics_events
         WHERE "portfolioId" = $1 AND type = 'page_view' AND "createdAt" >= $2`,
        [portfolioId, since],
      ),

      // Unique IPs among page_view events
      this.dataSource.query<[{ count: string }]>(
        `SELECT COUNT(DISTINCT ip) AS count
         FROM analytics_events
         WHERE "portfolioId" = $1 AND type = 'page_view' AND ip IS NOT NULL AND "createdAt" >= $2`,
        [portfolioId, since],
      ),

      // Top 5 sections by event count
      this.dataSource.query(
        `SELECT "sectionId", COUNT(*) AS views
         FROM analytics_events
         WHERE "portfolioId" = $1 AND "sectionId" IS NOT NULL AND "createdAt" >= $2
         GROUP BY "sectionId"
         ORDER BY views DESC
         LIMIT 5`,
        [portfolioId, since],
      ) as Promise<Array<{ sectionId: string; views: string }>>,

      // Daily page_view counts
      this.dataSource.query(
        `SELECT TO_CHAR("createdAt"::date, 'YYYY-MM-DD') AS date, COUNT(*) AS views
         FROM analytics_events
         WHERE "portfolioId" = $1 AND type = 'page_view' AND "createdAt" >= $2
         GROUP BY "createdAt"::date
         ORDER BY "createdAt"::date ASC`,
        [portfolioId, since],
      ) as Promise<Array<{ date: string; views: string }>>,
    ]);

    return {
      portfolioId,
      totalViews: parseInt(totalViewsRow[0]?.count ?? '0', 10),
      uniqueVisitors: parseInt(uniqueVisitorsRow[0]?.count ?? '0', 10),
      topSections: topSectionsRows.map((r: { sectionId: string; views: string }) => ({
        sectionId: r.sectionId,
        views: parseInt(r.views, 10),
      })),
      viewsByDay: viewsByDayRows.map((r: { date: string; views: string }) => ({
        date: r.date,
        views: parseInt(r.views, 10),
      })),
    };
  }
}
