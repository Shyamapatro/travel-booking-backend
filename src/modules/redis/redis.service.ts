import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';
import { DEFAULT_REDIS_CONFIG } from '../../common';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(RedisService.name);
  private client: Redis;

  constructor(private configService: ConfigService) { }

  onModuleInit() {
    this.client = new Redis({
      host: this.configService.get<string>('REDIS_HOST', DEFAULT_REDIS_CONFIG.HOST),
      port: this.configService.get<number>('REDIS_PORT', DEFAULT_REDIS_CONFIG.PORT as number),
      password: this.configService.get<string>('REDIS_PASSWORD') || undefined,
    });

    this.client.on('connect', () => {
      this.logger.log('Successfully connected to Redis');
    });

    this.client.on('error', (err) => {
      this.logger.error('Redis connection error', err);
    });
  }

  onModuleDestroy() {
    this.client.disconnect();
  }

  async get(key: string): Promise<string | null> {
    try {
      return await this.client.get(key);
    } catch (error) {
      this.logger.error(`Error getting key ${key} from Redis: ${error.message}`);
      return null;
    }
  }

  async set(key: string, value: string, ttlSeconds?: number): Promise<'OK' | null> {
    try {
      if (ttlSeconds) {
        return await this.client.set(key, value, 'EX', ttlSeconds);
      }
      return await this.client.set(key, value);
    } catch (error) {
      this.logger.error(`Error setting key ${key} in Redis: ${error.message}`);
      return null;
    }
  }

  async del(key: string): Promise<number> {
    try {
      return await this.client.del(key);
    } catch (error) {
      this.logger.error(`Error deleting key ${key} from Redis: ${error.message}`);
      return 0;
    }
  }

  async getJSON<T>(key: string): Promise<T | null> {
    try {
      const data = await this.get(key);
      if (!data) return null;
      return JSON.parse(data) as T;
    } catch (error) {
      this.logger.error(`Error parsing JSON for key ${key}`, error);
      return null;
    }
  }

  async setJSON(key: string, value: any, ttlSeconds?: number): Promise<'OK' | null> {
    const stringValue = JSON.stringify(value);
    return this.set(key, stringValue, ttlSeconds);
  }
}
