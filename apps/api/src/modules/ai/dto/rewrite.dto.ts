import { IsString, IsIn, IsOptional, MaxLength } from 'class-validator';

export class RewriteDto {
  @IsString()
  @MaxLength(10_000)
  text: string;

  @IsIn(['improve', 'grammar', 'shorten'])
  action: 'improve' | 'grammar' | 'shorten';

  /** 'html' (default) for Tiptap-authored fields; 'text' for plain fields
   *  like the portfolio bio, so the model doesn't wrap the result in <p>. */
  @IsOptional()
  @IsIn(['html', 'text'])
  format?: 'html' | 'text';
}
