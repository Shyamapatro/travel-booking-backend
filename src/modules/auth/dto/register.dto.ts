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
}
