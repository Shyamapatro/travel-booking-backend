import { Body, Controller, HttpStatus, Post, UnauthorizedException, UseGuards, BadRequestException, Logger, Req } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { ApiBody, ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { AuthGuard } from '@nestjs/passport';
import { ThrottlerGuard } from '@nestjs/throttler';
import { ResponseMessage, APP_MESSAGES } from '../../common';


@ApiTags('Auth')
@Controller('auth')
  @UseGuards(ThrottlerGuard)
export class AuthController {
  private readonly logger = new Logger(AuthController.name);
  constructor(private authService: AuthService) { }

  @Post('register')
  @ResponseMessage(APP_MESSAGES.AUTH.REGISTER_SUCCESS)
  async register(@Body() body: RegisterDto) {
    try {
      return await this.authService.register(body);
    } catch (error) {
      this.logger.error(`Registration failed for ${body.email}: ${error.message}`);
      throw error;
    }
  }

  @Post('login')
  @ApiBody({ type: LoginDto })
  @ResponseMessage(APP_MESSAGES.AUTH.LOGIN_SUCCESS)
  async login(@Body() body: LoginDto) {
    try {
      const user = await this.authService.validateUser(
        body,
        body.password,
      );
      if (!user) {
        throw new UnauthorizedException(APP_MESSAGES.AUTH.INVALID_CREDENTIALS);
      }

      return await this.authService.login(user);
    } catch (error) {
      const id = body.email || body.phoneNumber;
      this.logger.error(`Login failed for ${id}: ${error.message}`);
      throw error;
    }
  }

  @Post('forgot-password')
  @ResponseMessage(APP_MESSAGES.AUTH.FORGOT_PASSWORD_SENT)
  async forgotPassword(@Body() body: ForgotPasswordDto) {
    try {
      return await this.authService.forgotPassword(body);
    } catch (error) {
      this.logger.error(`Forgot password failed: ${error.message}`);
      throw error;
    }
  }

  @Post('reset-password')
  @ResponseMessage(APP_MESSAGES.AUTH.RESET_PASSWORD_SUCCESS)
  async resetPassword(@Body() body: ResetPasswordDto) {
    try {
      return await this.authService.resetPassword(body.token, body.newPassword);
    } catch (error) {
      this.logger.error(`Reset password failed: ${error.message}`);
      throw error;
    }
  }

  @Post('refresh')
  @ApiBody({ type: RefreshTokenDto })
  @ResponseMessage(APP_MESSAGES.AUTH.REFRESH_SUCCESS)
  async refresh(@Body() body: RefreshTokenDto) {
    try {
      return await this.authService.refreshToken(body.refreshToken);
    } catch (error) {
      this.logger.error(`Token refresh failed: ${error.message}`);
      throw error;
    }
  }

  @Post('logout')
  @ApiBearerAuth('JWT-auth')
  @UseGuards(AuthGuard('jwt'))
  @ResponseMessage(APP_MESSAGES.AUTH.LOGOUT_SUCCESS)
  async logout(@Req() req) {
    try {
      return await this.authService.logout(req.user.userId);
    } catch (error) {
      this.logger.error(`Logout failed for user ${req.user.userId}: ${error.message}`);
      throw error;
    }
  }
}
