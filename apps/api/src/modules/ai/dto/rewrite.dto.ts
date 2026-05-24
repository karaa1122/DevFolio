import { IsString, IsIn, MaxLength } from 'class-validator';

export class RewriteDto {
  @IsString()
  @MaxLength(10_000)
  text: string;

  @IsIn(['improve', 'grammar', 'shorten'])
  action: 'improve' | 'grammar' | 'shorten';
}
