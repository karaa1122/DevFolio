import { IsEmail, IsString, MinLength, MaxLength, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterDto {
  @ApiProperty({ example: 'Karaa Kamaran' })
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  name: string;

  @ApiProperty({ example: 'karaa@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'Password123!' })
  @IsString()
  @MinLength(8)
  @MaxLength(72)
  @Matches(/(?=.*[0-9])(?=.*[a-zA-Z])/, {
    message: 'Password must contain at least one letter and one number',
  })
  password: string;
}
