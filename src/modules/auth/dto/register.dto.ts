import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength } from 'class-validator';

export class RegisterDto {
  @ApiProperty({ example: 'user@test.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'Secret@123' })
  @IsString()
  @MinLength(6)
  password: string;

  @ApiProperty({ example: '9876543210' })
  @IsString()
  @MinLength(10)
  phoneNumber: string;

  @ApiProperty({ example: '+91', required: false })
  @IsString()
  @MinLength(2)
  countryCode?: string;
}
