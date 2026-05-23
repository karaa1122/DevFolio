import { IsOptional, IsObject } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import type { Resume } from '@devfolio/shared';

export class UpdateResumeDto {
  @ApiPropertyOptional({ description: 'Partial Resume JSON — merged with existing data' })
  @IsOptional()
  @IsObject()
  data?: Partial<Resume>;
}
