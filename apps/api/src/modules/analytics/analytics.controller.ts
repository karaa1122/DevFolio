import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  Query,
  Req,
  UseGuards,
  HttpCode,
  HttpStatus,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import type { Request } from 'express';
import { AnalyticsService } from './analytics.service';
import { TrackEventDto } from './dto/track-event.dto';
import { Public } from '../../common/decorators/public.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Portfolio } from '../../database/entities/portfolio.entity';
import type { User } from '../../database/entities/user.entity';

@ApiTags('analytics')
@Controller({ path: 'analytics', version: '1' })
export class AnalyticsController {
  constructor(
    private readonly analyticsService: AnalyticsService,
    @InjectRepository(Portfolio) private readonly portfolioRepo: Repository<Portfolio>,
  ) {}

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
  async getPortfolioAnalytics(
    @CurrentUser() user: User,
    @Param('id') portfolioId: string,
    @Query('days') days: number,
  ) {
    const portfolio = await this.portfolioRepo.findOne({ where: { id: portfolioId } });
    if (!portfolio) throw new NotFoundException('Portfolio not found');
    if (portfolio.userId !== user.id) throw new ForbiddenException('Access denied');
    return this.analyticsService.getPortfolioAnalytics(portfolioId, days ?? 30);
  }
}
