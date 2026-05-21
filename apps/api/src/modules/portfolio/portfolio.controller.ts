import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiParam } from '@nestjs/swagger';
import { PortfolioService } from './portfolio.service';
import { CreatePortfolioDto } from './dto/create-portfolio.dto';
import { UpdatePortfolioDto } from './dto/update-portfolio.dto';
import { UpdateSlugDto } from './dto/update-slug.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Public } from '../../common/decorators/public.decorator';
import type { User } from '../../database/entities/user.entity';

@ApiTags('portfolios')
@Controller({ path: 'portfolios', version: '1' })
export class PortfolioController {
  constructor(private readonly portfolioService: PortfolioService) {}

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Post()
  @ApiOperation({ summary: 'Create a new portfolio' })
  create(@CurrentUser() user: User, @Body() dto: CreatePortfolioDto) {
    return this.portfolioService.create(user.id, dto);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Get('mine')
  @ApiOperation({ summary: 'List all portfolios for current user' })
  findMine(@CurrentUser() user: User) {
    return this.portfolioService.findByUserId(user.id);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Get(':id')
  @ApiOperation({ summary: 'Get portfolio by ID (owner only)' })
  findOne(@CurrentUser() user: User, @Param('id') id: string) {
    return this.portfolioService.findById(id, user.id);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Patch(':id')
  @ApiOperation({ summary: 'Update portfolio JSON' })
  update(@CurrentUser() user: User, @Param('id') id: string, @Body() dto: UpdatePortfolioDto) {
    return this.portfolioService.update(id, user.id, dto);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Patch(':id/slug')
  @ApiOperation({ summary: 'Update portfolio slug' })
  updateSlug(@CurrentUser() user: User, @Param('id') id: string, @Body() dto: UpdateSlugDto) {
    return this.portfolioService.updateSlug(id, user.id, dto.slug);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Post(':id/publish')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Publish portfolio (make public)' })
  publish(@CurrentUser() user: User, @Param('id') id: string) {
    return this.portfolioService.publish(id, user.id);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Post(':id/unpublish')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Unpublish portfolio' })
  unpublish(@CurrentUser() user: User, @Param('id') id: string) {
    return this.portfolioService.unpublish(id, user.id);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete portfolio' })
  delete(@CurrentUser() user: User, @Param('id') id: string) {
    return this.portfolioService.delete(id, user.id);
  }

  @Public()
  @Get('by-slug/:slug')
  @ApiOperation({ summary: 'Get published portfolio by slug (public)' })
  @ApiParam({ name: 'slug', description: 'Portfolio slug' })
  findBySlug(@Param('slug') slug: string) {
    return this.portfolioService.findBySlug(slug);
  }
}
