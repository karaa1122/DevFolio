import { IsString, MaxLength, Matches } from 'class-validator';
import { Transform } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

// Hostname per RFC 1123: labels of a-z/0-9/hyphen, no leading/trailing hyphen,
// at least one dot (no bare TLDs / localhost). Lower-cased and trimmed first.
const DOMAIN_REGEX =
  /^(?=.{1,253}$)([a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,63}$/;

export class SetDomainDto {
  @ApiProperty({ example: 'portfolio.johndoe.com' })
  @IsString()
  @MaxLength(253)
  @Transform(({ value }) =>
    typeof value === 'string'
      ? value
        .trim()
        .toLowerCase()
        .replace(/^https?:\/\//, '')
        .replace(/\/.*$/, '')
        .replace(/\.$/, '')
      : value,
  )
  @Matches(DOMAIN_REGEX, { message: 'Must be a valid domain name (e.g. portfolio.example.com)' })
  domain: string;
}
