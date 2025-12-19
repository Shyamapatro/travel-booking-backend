import { Injectable, Logger } from '@nestjs/common';
import { Model } from 'mongoose';
import { User } from './schemas/user.schema';
import { InjectModel } from '@nestjs/mongoose';
import { RedisService } from '../redis/redis.service';
import { REDIS_KEYS, CACHE_TTL } from '../../common';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    private readonly redisService: RedisService,
  ) {}

  private getProfileCacheKey(userId: string): string {
    return REDIS_KEYS.USER_PROFILE(userId);
  }

  async findByEmail(email: string) {
    try {
      return await this.userModel.findOne({ email });
    } catch (error) {
      this.logger.error(`Error finding user by email ${email}: ${error.message}`);
      throw error;
    }
  }

  async findByPhoneNumber(phoneNumber: string) {
    try {
      return await this.userModel.findOne({ phoneNumber });
    } catch (error) {
      this.logger.error(`Error finding user by phone number ${phoneNumber}: ${error.message}`);
      throw error;
    }
  }

  async findUserByIdentifierForAuth(identifier: { email?: string; phoneNumber?: string }) {
    try {
      const query = identifier.email ? { email: identifier.email } : { phoneNumber: identifier.phoneNumber };
      return await this.userModel.findOne(query).select('+password');
    } catch (error) {
      this.logger.error(`Error finding user for auth by identifier ${JSON.stringify(identifier)}: ${error.message}`);
      throw error;
    }
  }

  async createUser(data: {
    email: string;
    password?: string;
    phoneNumber?: string;
    countryCode?: string;
  }) {
    try {
      this.logger.log(`Creating new user: ${data.email}`);
      return await this.userModel.create(data);
    } catch (error) {
      this.logger.error(`Error creating user ${data.email}: ${error.message}`);
      throw error;
    }
  }

  async findById(userId: string) {
    try {
      const cacheKey = this.getProfileCacheKey(userId);

      // Try cache first
      const cachedUser = await this.redisService.getJSON<User>(cacheKey);
      if (cachedUser) {
        this.logger.debug(`Cache HIT for user: ${userId}`);
        return cachedUser;
      }

      this.logger.debug(`Cache MISS for user: ${userId}`);
      const user = await this.userModel.findById(userId).select('-password');

      if (user) {
        // Store in cache
        await this.redisService.setJSON(cacheKey, user.toObject(), CACHE_TTL.ONE_HOUR);
      }

      return user;
    } catch (error) {
      this.logger.error(`Error finding user by ID ${userId}: ${error.message}`, error.stack);
      throw error;
    }
  }

  async update(userId: string, updateData: any) {
    try {
      const result = await this.userModel.findByIdAndUpdate(userId, updateData, { new: true });

      // Invalidate cache
      const cacheKey = this.getProfileCacheKey(userId);
      await this.redisService.del(cacheKey);
      this.logger.debug(`Cache invalidated for user: ${userId}`);

      return result;
    } catch (error) {
      this.logger.error(`Error updating user ${userId}: ${error.message}`, error.stack);
      throw error;
    }
  }

  async findOne(query: any) {
    try {
      return await this.userModel.findOne(query);
    } catch (error) {
      this.logger.error(`Error finding user with query ${JSON.stringify(query)}: ${error.message}`);
      throw error;
    }
  }
}
