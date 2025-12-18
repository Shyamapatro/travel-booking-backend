import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHealthStatus(): Record<string, any> {
    return {
      status: 'success',
      message: 'Travel Booking API is operational 🚀',
      timestamp: new Date().toISOString(),
      version: '1.0.0',
    };
  }
}
