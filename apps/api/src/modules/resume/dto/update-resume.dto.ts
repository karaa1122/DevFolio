import { IsOptional, IsObject } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import type { Resume } from '@devfolio/shared';

export class UpdateResumeDto {
  @ApiPropertyOptional({ description: 'Partial resume data — merged with existing' })
  @IsOptional()
  @IsObject()
  data?: Partial<Resume>;
}
