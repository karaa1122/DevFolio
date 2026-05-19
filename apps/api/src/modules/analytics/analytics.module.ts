import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AnalyticsService } from './analytics.service';
import { AnalyticsController } from './analytics.controller';
import { AnalyticsEvent } from '../../database/entities/analytics-event.entity';
import { Portfolio } from '../../database/entities/portfolio.entity';

@Module({
  imports: [TypeOrmModule.forFeature([AnalyticsEvent, Portfolio])],
  controllers: [AnalyticsController],
  providers: [AnalyticsService],
  exports: [AnalyticsService],
})
export class AnalyticsModule {}
