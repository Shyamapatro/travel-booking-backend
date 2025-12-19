import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class RefreshTokenDto {
  @ApiProperty({ description: 'The refresh token to use' })
  @IsNotEmpty()
  @IsString()
  refreshToken: string;
}
