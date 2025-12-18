import { Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { User } from './schemas/user.schema';
import { InjectModel } from '@nestjs/mongoose';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
  ) {}

  async findByEmail(email: string) {
    return this.userModel.findOne({ email });
  }

  async createUser(email: string, hashedPassword: string) {
    return this.userModel.create({
      email,
      password: hashedPassword,
    });
  }

  async findById(userId: string) {
    return this.userModel.findById(userId).select('-password');
  }
}
