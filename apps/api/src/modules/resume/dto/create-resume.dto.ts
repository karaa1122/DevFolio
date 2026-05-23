import { IsString, IsOptional, Matches, MinLength, MaxLength, IsIn } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { RESUME_TEMPLATE_IDS, type ResumeTemplateId } from '@devfolio/shared';

export class CreateResumeDto {
  @ApiProperty({
    example: 'backend-engineer',
    description: 'Per-user unique resume slug (lowercase alphanumeric + hyphens)',
  })
  @IsString()
  @MinLength(3)
  @MaxLength(50)
  @Matches(/^[a-z0-9-]+$/, { message: 'Slug must be lowercase alphanumeric with hyphens only' })
  slug: string;

  @ApiPropertyOptional({ example: 'Backend Engineer — 2026' })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  title?: string;

  @ApiPropertyOptional({ example: 'classic', enum: RESUME_TEMPLATE_IDS })
  @IsOptional()
  @IsIn(RESUME_TEMPLATE_IDS as unknown as string[])
  template?: ResumeTemplateId;

  @ApiPropertyOptional({ example: 'Senior Backend Engineer' })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  targetRole?: string;
}
