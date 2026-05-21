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
  @ApiOperation({ summary: 'Create a resume (optionally import from portfolio)' })
  create(@CurrentUser() user: User, @Body() dto: CreateResumeDto) {
    return this.resumeService.create(user.id, dto);
  }

  @Get()
  @ApiOperation({ summary: 'List current user resumes' })
  findMine(@CurrentUser() user: User) {
    return this.resumeService.findByUserId(user.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get resume by ID' })
  findOne(@CurrentUser() user: User, @Param('id') id: string) {
    return this.resumeService.findById(id, user.id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update resume data/theme/layout' })
  update(@CurrentUser() user: User, @Param('id') id: string, @Body() dto: UpdateResumeDto) {
    return this.resumeService.update(id, user.id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a resume' })
  delete(@CurrentUser() user: User, @Param('id') id: string) {
    return this.resumeService.delete(id, user.id);
  }

  @Post(':id/export')
  @ApiOperation({ summary: 'Queue a PDF export job for this resume' })
  export(@CurrentUser() user: User, @Param('id') id: string) {
    return this.resumeService.createExportJob(id, user.id);
  }

  @Get(':id/exports')
  @ApiOperation({ summary: 'List export jobs for this resume' })
  listExports(@CurrentUser() user: User, @Param('id') id: string) {
    return this.resumeService.findExportJobs(id, user.id);
  }
}
