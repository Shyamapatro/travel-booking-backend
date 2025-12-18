import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcrypt';

import { Types } from 'mongoose';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) { }

  async register(email: string, password: string) {
    const existingUser = await this.usersService.findByEmail(email);
    if (existingUser) {
      throw new BadRequestException('Email already registered');
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await this.usersService.createUser(email, hashedPassword);

    return {
      id: user._id.toString(),
      email: user.email,
    };
  }

  async login(user: { _id: Types.ObjectId; email: string }) {
    const payload = {
      sub: user._id.toString(),
      email: user.email,
    };

    return {
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
    const user = await this.usersService.findByEmail(email);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return user;
  }
}
