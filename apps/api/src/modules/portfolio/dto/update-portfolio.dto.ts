import { IsOptional, IsObject } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import type { Portfolio } from '@devfolio/shared';

export class UpdatePortfolioDto {
  @ApiPropertyOptional({ description: 'Partial Portfolio JSON — merged with existing data' })
  @IsOptional()
  @IsObject()
  data?: Partial<Portfolio>;
}
