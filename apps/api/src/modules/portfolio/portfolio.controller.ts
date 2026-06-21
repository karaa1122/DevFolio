import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Put,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiParam } from '@nestjs/swagger';
import { PortfolioService } from './portfolio.service';
import { CreatePortfolioDto } from './dto/create-portfolio.dto';
import { UpdatePortfolioDto } from './dto/update-portfolio.dto';
import { UpdateSlugDto } from './dto/update-slug.dto';
import { SetDomainDto } from './dto/set-domain.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Public } from '../../common/decorators/public.decorator';
import type { User } from '../../database/entities/user.entity';

@ApiTags('portfolios')
@Controller({ path: 'portfolios', version: '1' })
export class PortfolioController {
  constructor(private readonly portfolioService: PortfolioService) { }

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

  // On-demand TLS guard for the edge (Caddy). Declared before `:id` so the
  // literal "domain-check" segment isn't captured as a portfolio id. Returns
  // 200 when a verified + published portfolio serves the given host (so the
  // edge may issue a certificate for it), 404 otherwise. Public + unauthenticated
  // because the TLS layer calls it on every handshake for an unknown host.
  @Public()
  @Get('domain-check')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'On-demand TLS ask endpoint: 200 if this host maps to a live portfolio, else 404',
  })
  async domainCheck(@Query('domain') domain?: string): Promise<void> {
    if (!domain) throw new BadRequestException('domain query parameter is required');
    if (!(await this.portfolioService.isDomainServable(domain))) {
      throw new NotFoundException();
    }
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

  // ─── Custom domain management (owner only) ────────────────────────────────

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Get(':id/domain')
  @ApiOperation({ summary: 'Get custom domain status and DNS instructions' })
  getDomain(@CurrentUser() user: User, @Param('id') id: string) {
    return this.portfolioService.getDomainStatus(id, user.id);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Put(':id/domain')
  @ApiOperation({ summary: 'Set or change the custom domain for a portfolio' })
  setDomain(@CurrentUser() user: User, @Param('id') id: string, @Body() dto: SetDomainDto) {
    return this.portfolioService.setDomain(id, user.id, dto.domain);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Post(':id/domain/verify')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Verify custom domain ownership via DNS TXT record' })
  verifyDomain(@CurrentUser() user: User, @Param('id') id: string) {
    return this.portfolioService.verifyDomain(id, user.id);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Delete(':id/domain')
  @ApiOperation({ summary: 'Remove the custom domain from a portfolio' })
  removeDomain(@CurrentUser() user: User, @Param('id') id: string) {
    return this.portfolioService.removeDomain(id, user.id);
  }

  @Public()
  @Get('by-slug/:slug')
  @ApiOperation({ summary: 'Get published portfolio by slug (public)' })
  @ApiParam({ name: 'slug', description: 'Portfolio slug' })
  findBySlug(@Param('slug') slug: string) {
    return this.portfolioService.findBySlug(slug);
  }

  @Public()
  @Get('by-domain/:domain')
  @ApiOperation({ summary: 'Get published portfolio by verified custom domain (public)' })
  @ApiParam({ name: 'domain', description: 'Verified custom domain (host)' })
  findByDomain(@Param('domain') domain: string) {
    return this.portfolioService.findByDomain(domain);
  }
}
