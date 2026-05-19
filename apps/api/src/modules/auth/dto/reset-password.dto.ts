import { IsString, MinLength, MaxLength, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ResetPasswordDto {
  @ApiProperty({ description: 'Password reset token from email link' })
  @IsString()
  @MinLength(64)
  @MaxLength(64)
  token: string;

  @ApiProperty({ example: 'NewPassword123!' })
  @IsString()
  @MinLength(8)
  @MaxLength(72)
  @Matches(/(?=.*[0-9])(?=.*[a-zA-Z])/, {
    message: 'Password must contain at least one letter and one number',
  })
  password: string;
}
