import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
  ConflictException,
  Logger,
} from '@nestjs/common';

import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcrypt';

import { Types } from 'mongoose';
import { APP_MESSAGES, REDIS_KEYS, CACHE_TTL } from '../../common';
import { RedisService } from '../redis/redis.service';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly redisService: RedisService,
  ) { }

  async register(data: {
    email: string;
    password: string;
    phoneNumber: string;
    countryCode?: string;
  }) {
    try {
      this.logger.log(`Registering new user with email: ${data.email}`);

      const existingUser = await this.usersService.findByEmail(data.email);
      if (existingUser) {
        throw new ConflictException(APP_MESSAGES.AUTH.EMAIL_EXISTS);
      }

      const existingPhone = await this.usersService.findByPhoneNumber(data.phoneNumber);
      if (existingPhone) {
        throw new ConflictException(APP_MESSAGES.AUTH.PHONE_EXISTS);
      }

      const hashedPassword = await bcrypt.hash(data.password, 10);

      const user = await this.usersService.createUser({
        email: data.email,
        password: hashedPassword,
        phoneNumber: data.phoneNumber,
        countryCode: data.countryCode,
      });

      return await this.generateTokens(user);
    } catch (error) {
      if (error instanceof ConflictException) throw error;
      this.logger.error(`Error during registration: ${error.message}`, error.stack);
      throw error;
    }
  }

  async login(user: { _id: Types.ObjectId; email: string }) {
    try {
      return await this.generateTokens(user);
    } catch (error) {
      this.logger.error(`Error during login: ${error.message}`, error.stack);
      throw error;
    }
  }

  private async generateTokens(user: any) {
    const userId = user._id.toString();
    const payload = {
      sub: userId,
      email: user.email,
    };

    // Sanitize user object
    const userObject = user.toObject ? user.toObject() : user;
    const { password, __v, createdAt, updatedAt, ...sanitizedUser } = userObject;

    const accessToken = this.jwtService.sign(payload, {
      secret: process.env.JWT_ACCESS_SECRET as string,
      expiresIn: process.env.JWT_ACCESS_TTL as any,
    });

    const refreshToken = this.jwtService.sign(payload, {
      secret: process.env.JWT_REFRESH_SECRET as string,
      expiresIn: process.env.JWT_REFRESH_TTL as any,
    });

    // Store refresh token in Redis for revocation support
    await this.redisService.set(
      REDIS_KEYS.REFRESH_TOKEN(userId),
      refreshToken,
      CACHE_TTL.SEVEN_DAYS
    );

    return {
      user: sanitizedUser,
      accessToken,
      refreshToken,
    };
  }

  async logout(userId: string) {
    try {
      this.logger.log(`Logging out user: ${userId}`);
      await this.redisService.del(REDIS_KEYS.REFRESH_TOKEN(userId));
      return { success: true };
    } catch (error) {
      this.logger.error(`Error during logout: ${error.message}`, error.stack);
      throw error;
    }
  }

  async refreshToken(token: string) {
    try {
      const payload = this.jwtService.verify(token, {
        secret: process.env.JWT_REFRESH_SECRET as string,
      });

      const userId = payload.sub;
      const storedToken = await this.redisService.get(REDIS_KEYS.REFRESH_TOKEN(userId));

      if (!storedToken || storedToken !== token) {
        throw new UnauthorizedException('Invalid or revoked refresh token');
      }

      const user = await this.usersService.findById(userId);
      if (!user) {
        throw new UnauthorizedException('User not found');
      }

      return await this.generateTokens(user);
    } catch (error) {
      this.logger.error(`Error during token refresh: ${error.message}`, error.stack);
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async validateUser(identifier: { email?: string; phoneNumber?: string }, password: string) {
    try {
      const idStr = identifier.email || identifier.phoneNumber;
      this.logger.debug(`Validating user: ${idStr}`);

      const user = await this.usersService.findUserByIdentifierForAuth(identifier);
      if (!user) {
        this.logger.warn(`User not found during validation: ${idStr}`);
        throw new UnauthorizedException(APP_MESSAGES.AUTH.INVALID_CREDENTIALS);
      }

      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        this.logger.warn(`Invalid password for user: ${idStr}`);
        throw new UnauthorizedException(APP_MESSAGES.AUTH.INVALID_CREDENTIALS);
      }

      this.logger.log(`User validated successfully: ${idStr}`);
      return user;
    } catch (error) {
      if (error instanceof UnauthorizedException) throw error;
      this.logger.error(`Error during user validation: ${error.message}`, error.stack);
      throw error;
    }
  }

  async forgotPassword(data: { email?: string; phoneNumber?: string }) {
    try {
      let user;
      if (data.email) {
        user = await this.usersService.findByEmail(data.email);
      } else if (data.phoneNumber) {
        user = await this.usersService.findByPhoneNumber(data.phoneNumber);
      }

      if (!user) {
        // Don't reveal user existence
        this.logger.warn(`Forgot password attempt for non-existent identifier: ${JSON.stringify(data)}`);
        return { message: APP_MESSAGES.AUTH.FORGOT_PASSWORD_SENT };
      }

      const resetToken = require('crypto').randomBytes(32).toString('hex');
      const hash = require('crypto').createHash('sha256').update(resetToken).digest('hex');

      await this.usersService.update(user._id.toString(), {
        resetPasswordToken: hash,
        resetPasswordExpires: Date.now() + 3600000, // 1 hour
      });

      // In a real app, send email or SMS here. For now, log the token.
      this.logger.log(`============================================`);
      this.logger.log(`Reset Token for ${data.email || data.phoneNumber}: ${resetToken}`);
      this.logger.log(`============================================`);

      return { message: APP_MESSAGES.AUTH.FORGOT_PASSWORD_SENT };
    } catch (error) {
      this.logger.error(`Error during forgot password process: ${error.message}`, error.stack);
      throw error;
    }
  }

  async resetPassword(token: string, newPassword: string) {
    try {
      const hashedToken = require('crypto').createHash('sha256').update(token).digest('hex');

      const user = await this.usersService.findOne({
        resetPasswordToken: hashedToken,
        resetPasswordExpires: { $gt: Date.now() },
      });

      if (!user) {
        throw new BadRequestException(APP_MESSAGES.AUTH.INVALID_TOKEN);
      }

      const hashedPassword = await bcrypt.hash(newPassword, 10);
      await this.usersService.update(user._id.toString(), {
        password: hashedPassword,
        resetPasswordToken: undefined,
        resetPasswordExpires: undefined,
      });

      return { message: APP_MESSAGES.AUTH.RESET_PASSWORD_SUCCESS };
    } catch (error) {
      if (error instanceof BadRequestException) throw error;
      this.logger.error(`Error during password reset: ${error.message}`, error.stack);
      throw error;
    }
  }
}
