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
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { ResumeService } from './resume.service';
import { CreateResumeDto } from './dto/create-resume.dto';
import { UpdateResumeDto } from './dto/update-resume.dto';
import { UpdateResumeSlugDto } from './dto/update-slug.dto';
import { DuplicateResumeDto } from './dto/duplicate-resume.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { User } from '../../database/entities/user.entity';

@ApiTags('resumes')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller({ path: 'resumes', version: '1' })
export class ResumeController {
  constructor(private readonly resumeService: ResumeService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new resume' })
  create(@CurrentUser() user: User, @Body() dto: CreateResumeDto) {
    return this.resumeService.create(user.id, dto);
  }

  @Get('mine')
  @ApiOperation({ summary: 'List all resumes for current user' })
  findMine(@CurrentUser() user: User) {
    return this.resumeService.findByUserId(user.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get resume by ID (owner only)' })
  findOne(@CurrentUser() user: User, @Param('id') id: string) {
    return this.resumeService.findById(id, user.id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update resume JSON' })
  update(
    @CurrentUser() user: User,
    @Param('id') id: string,
    @Body() dto: UpdateResumeDto,
  ) {
    return this.resumeService.update(id, user.id, dto);
  }

  @Patch(':id/slug')
  @ApiOperation({ summary: 'Update resume slug' })
  updateSlug(
    @CurrentUser() user: User,
    @Param('id') id: string,
    @Body() dto: UpdateResumeSlugDto,
  ) {
    return this.resumeService.updateSlug(id, user.id, dto.slug);
  }

  @Post(':id/duplicate')
  @ApiOperation({ summary: 'Duplicate resume (per-job tailoring)' })
  duplicate(
    @CurrentUser() user: User,
    @Param('id') id: string,
    @Body() dto: DuplicateResumeDto,
  ) {
    return this.resumeService.duplicate(id, user.id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete resume' })
  delete(@CurrentUser() user: User, @Param('id') id: string) {
    return this.resumeService.delete(id, user.id);
  }
}
