import { IsString, IsOptional, IsUUID, MaxLength } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class CreateResumeDto {
  @ApiPropertyOptional({ description: 'Import sections from this portfolio' })
  @IsOptional()
  @IsUUID()
  portfolioId?: string;

  @ApiPropertyOptional({ example: 'Software Engineer Resume' })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  title?: string;
}
