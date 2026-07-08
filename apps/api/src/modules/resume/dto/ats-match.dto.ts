import { IsString, MinLength, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AtsMatchDto {
  @ApiProperty({ description: 'Job description to score the resume against' })
  @IsString()
  @MinLength(30, { message: 'Paste the full job description (at least 30 characters)' })
  @MaxLength(20000)
  jobDescription: string;
}
