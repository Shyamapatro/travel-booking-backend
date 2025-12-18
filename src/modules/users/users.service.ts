import { Injectable, Logger } from '@nestjs/common';
import { Model } from 'mongoose';
import { User } from './schemas/user.schema';
import { InjectModel } from '@nestjs/mongoose';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
  ) {}

  async findByEmail(email: string) {
    return this.userModel.findOne({ email });
  }

  async findUserByEmailForAuth(email: string) {
    return this.userModel.findOne({ email }).select('+password');
  }

  async createUser(data: {
    email: string;
    password?: string;
    phoneNumber?: string;
    countryCode?: string;
  }) {
    this.logger.log(`Creating new user: ${data.email}`);
    return this.userModel.create(data);
  }


  async findById(userId: string) {
    return this.userModel.findById(userId).select('-password');
  }
}
