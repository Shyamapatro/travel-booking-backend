import { Controller, Get, Logger } from '@nestjs/common';
import { AppService } from './app.service';
import { ResponseMessage, APP_MESSAGES } from './common';

@Controller()
export class AppController {
  private readonly logger = new Logger(AppController.name);
  constructor(private readonly appService: AppService) { }

  @Get()
  @ResponseMessage('API Status OK')
  getHealthCheck(): Record<string, any> {
    try {
      return this.appService.getHealthStatus();
    } catch (error) {
      this.logger.error(`Health check failed: ${error.message}`);
      throw error;
    }
  }
}
