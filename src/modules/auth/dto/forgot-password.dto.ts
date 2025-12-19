import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsOptional, IsString, ValidateIf } from 'class-validator';

export class ForgotPasswordDto {
  @ApiProperty({ example: 'user@example.com', required: false })
  @ValidateIf((o) => !o.phoneNumber)
  @IsNotEmpty({ message: 'Email or Phone Number must be provided' })
  @IsEmail()
  email?: string;

  @ApiProperty({ example: '9876543210', required: false })
  @ValidateIf((o) => !o.email)
  @IsNotEmpty({ message: 'Email or Phone Number must be provided' })
  @IsString()
  phoneNumber?: string;
}
