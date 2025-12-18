import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { UsersService } from './users.service';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@ApiBearerAuth('JWT-auth')
@UseGuards(AuthGuard('jwt'))
@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) { }
  @ApiTags('Users')
  @Get('profile')
  async profile(@Req() req) {
    return this.usersService.findById(req.user.userId);
  }
}
