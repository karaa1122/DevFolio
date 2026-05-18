import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import type { Request } from 'express';
import { AnalyticsEvent } from '../../database/entities/analytics-event.entity';
import type { TrackEventDto } from './dto/track-event.dto';
import type { PortfolioAnalytics } from '@devfolio/shared';

@Injectable()
export class AnalyticsService {
  constructor(
    @InjectRepository(AnalyticsEvent)
    private readonly eventRepo: Repository<AnalyticsEvent>,
  ) {}

  async track(dto: TrackEventDto, req: Request): Promise<void> {
    const event = this.eventRepo.create({
      portfolioId: dto.portfolioId,
      type: dto.type,
      sectionId: dto.sectionId,
      referrer: req.headers['referer'],
      userAgent: req.headers['user-agent'],
      ip: req.ip,
      metadata: dto.metadata,
    });
    await this.eventRepo.save(event);
  }

  async getPortfolioAnalytics(portfolioId: string, days = 30): Promise<PortfolioAnalytics> {
    const since = new Date();
    since.setDate(since.getDate() - days);

    const events = await this.eventRepo.find({
      where: { portfolioId },
      order: { createdAt: 'DESC' },
    });

    const pageViews = events.filter((e) => e.type === 'page_view');
    const uniqueIps = new Set(pageViews.map((e) => e.ip).filter(Boolean)).size;

    const sectionCounts = new Map<string, number>();
    for (const event of events) {
      if (event.sectionId) {
        sectionCounts.set(event.sectionId, (sectionCounts.get(event.sectionId) ?? 0) + 1);
      }
    }

    const topSections = Array.from(sectionCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([sectionId, views]) => ({ sectionId, views }));

    const viewsByDayMap = new Map<string, number>();
    for (const view of pageViews) {
      const day = view.createdAt.toISOString().split('T')[0];
      viewsByDayMap.set(day, (viewsByDayMap.get(day) ?? 0) + 1);
    }
    const viewsByDay = Array.from(viewsByDayMap.entries())
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([date, views]) => ({ date, views }));

    return {
      portfolioId,
      totalViews: pageViews.length,
      uniqueVisitors: uniqueIps,
      topSections,
      viewsByDay,
    };
  }
}
