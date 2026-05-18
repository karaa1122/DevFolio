import { Controller, Post, Get, Body, Param, Query, Req, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import type { Request } from 'express';
import { AnalyticsService } from './analytics.service';
import { TrackEventDto } from './dto/track-event.dto';
import { Public } from '../../common/decorators/public.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { User } from '../../database/entities/user.entity';

@ApiTags('analytics')
@Controller({ path: 'analytics', version: '1' })
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Public()
  @Post('track')
  @ApiOperation({ summary: 'Track a portfolio event (public endpoint)' })
  track(@Body() dto: TrackEventDto, @Req() req: Request) {
    return this.analyticsService.track(dto, req);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Get('portfolio/:id')
  @ApiOperation({ summary: 'Get analytics for a portfolio (owner only)' })
  getPortfolioAnalytics(
    @Param('id') portfolioId: string,
    @Query('days') days: number,
  ) {
    return this.analyticsService.getPortfolioAnalytics(portfolioId, days ?? 30);
  }
}
