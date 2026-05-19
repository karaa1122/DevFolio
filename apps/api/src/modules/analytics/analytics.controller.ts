import { Controller, Post, Get, Body, Param, Query, Req, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import type { Request } from 'express';
import { AnalyticsService } from './analytics.service';
import { TrackEventDto } from './dto/track-event.dto';
import { Public } from '../../common/decorators/public.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@ApiTags('analytics')
@Controller({ path: 'analytics', version: '1' })
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Public()
  @Post('track')
  @HttpCode(HttpStatus.NO_CONTENT)
  @Throttle({ default: { limit: 30, ttl: 60000 } })
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
