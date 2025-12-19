import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, MinLength, ValidateIf } from 'class-validator';

export class LoginDto {
  @ApiProperty({ example: 'user@example.com', required: false })
  @ValidateIf((o) => !o.phoneNumber)
  @IsEmail()
  @IsNotEmpty({ message: 'Email or Phone Number must be provided' })
  email?: string;

  @ApiProperty({ example: '9876543210', required: false })
  @ValidateIf((o) => !o.email)
  @IsString()
  @IsNotEmpty({ message: 'Email or Phone Number must be provided' })
  phoneNumber?: string;

  @ApiProperty({ example: 'password123' })
  @IsNotEmpty()
  @MinLength(6)
  password: string;
}
