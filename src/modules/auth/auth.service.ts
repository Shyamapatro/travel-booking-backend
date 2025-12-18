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

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) { }

  async register(data: {
    email: string;
    password: string;
    phoneNumber: string;
    countryCode?: string;
  }) {
    this.logger.log(`Registering new user with email: ${data.email}`);

    const existingUser = await this.usersService.findByEmail(data.email);
    if (existingUser) {
      throw new ConflictException('Email already registered');
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);


    const user = await this.usersService.createUser({
      email: data.email,
      password: hashedPassword,
      phoneNumber: data.phoneNumber,
      countryCode: data.countryCode,
    });

    return this.generateTokens(user);
  }

  async login(user: { _id: Types.ObjectId; email: string }) {
    return this.generateTokens(user);
  }

  private generateTokens(user: any) {
    const payload = {
      sub: user._id.toString(),
      email: user.email,
    };

    // Sanitize user object
    const userObject = user.toObject ? user.toObject() : user;
    const { password, __v, createdAt, updatedAt, ...sanitizedUser } = userObject;

    return {
      user: sanitizedUser,
      accessToken: this.jwtService.sign(payload, {
        secret: process.env.JWT_ACCESS_SECRET as string,
        expiresIn: process.env.JWT_ACCESS_TTL as any,
      }),
      refreshToken: this.jwtService.sign(payload, {
        secret: process.env.JWT_REFRESH_SECRET as string,
        expiresIn: process.env.JWT_REFRESH_TTL as any,
      }),
    };
  }

  async validateUser(email: string, password: string) {
    this.logger.debug(`Validating user: ${email}`);
    const user = await this.usersService.findUserByEmailForAuth(email);
    if (!user) {
      this.logger.warn(`User not found during validation: ${email}`);
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      this.logger.warn(`Invalid password for user: ${email}`);
      throw new UnauthorizedException('Invalid credentials');
    }

    this.logger.log(`User validated successfully: ${email}`);
    return user;
  }
}
