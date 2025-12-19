import { Controller, Get, Req, UseGuards, Logger } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { UsersService } from './users.service';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { ResponseMessage, APP_MESSAGES } from '../../common';

@ApiBearerAuth('JWT-auth')
@UseGuards(AuthGuard('jwt'))
@Controller('users')
export class UsersController {
  private readonly logger = new Logger(UsersController.name);
  constructor(private usersService: UsersService) { }
  @ApiTags('Users')
  @Get('profile')
  @ResponseMessage(APP_MESSAGES.USER.PROFILE_FETCHED)
  async profile(@Req() req) {
    try {
      return await this.usersService.findById(req.user.userId);
    } catch (error) {
      this.logger.error(`Error fetching profile for user ${req.user.userId}: ${error.message}`);
      throw error;
    }
  }
}
