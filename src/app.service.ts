import { Injectable } from '@nestjs/common';
import { APP_MESSAGES } from './common';

@Injectable()
export class AppService {
  getHealthStatus(): Record<string, any> {
    return {
      version: '1.0.0',
    };
  }
}
