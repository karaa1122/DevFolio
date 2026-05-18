import { IsString, IsOptional, Matches, MinLength, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreatePortfolioDto {
  @ApiProperty({ example: 'karaa', description: 'Unique URL slug (lowercase alphanumeric + hyphens)' })
  @IsString()
  @MinLength(3)
  @MaxLength(50)
  @Matches(/^[a-z0-9-]+$/, { message: 'Slug must be lowercase alphanumeric with hyphens only' })
  slug: string;

  @ApiPropertyOptional({ example: 'Karaa Kamaran — Backend Engineer' })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  title?: string;
}
