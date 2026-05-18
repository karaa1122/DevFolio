import { Controller, Get, Post, Body, Delete, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { IsArray, IsString, IsNumber } from 'class-validator';
import { GithubService } from './github.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { User } from '../../database/entities/user.entity';

class SyncReposDto {
  @IsString()
  portfolioId: string;

  @IsArray()
  @IsNumber({}, { each: true })
  repoIds: number[];
}

@ApiTags('github')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller({ path: 'github', version: '1' })
export class GithubController {
  constructor(private readonly githubService: GithubService) {}

  @Get('status')
  @ApiOperation({ summary: 'Check GitHub connection status' })
  status(@CurrentUser() user: User) {
    return this.githubService.getConnectionStatus(user.id);
  }

  @Get('repos')
  @ApiOperation({ summary: 'Fetch GitHub repositories' })
  repos(@CurrentUser() user: User) {
    return this.githubService.fetchUserRepos(user.id);
  }

  @Post('sync')
  @ApiOperation({ summary: 'Sync selected GitHub repos to portfolio projects' })
  sync(@CurrentUser() user: User, @Body() dto: SyncReposDto) {
    return this.githubService.syncReposToPortfolio(user.id, dto.portfolioId, dto.repoIds);
  }

  @Delete('disconnect')
  @ApiOperation({ summary: 'Disconnect GitHub account' })
  disconnect(@CurrentUser() user: User) {
    return this.githubService.disconnect(user.id);
  }
}
