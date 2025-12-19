import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { ApiResponse } from '../interfaces/api-response.interface';
import {
  RESPONSE_KEYS,
  APP_MESSAGES,
  SUCCESS_KEY,
  STATUS_CODE_KEY,
  MESSAGE_KEY,
  TIMESTAMP_KEY,
  PATH_KEY,
  ERRORS_KEY
} from '../constants';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = APP_MESSAGES.GENERAL.INTERNAL_SERVER_ERROR;
    let errors: any = undefined;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      if (typeof exceptionResponse === 'string') {
        message = exceptionResponse;
      } else if (typeof exceptionResponse === 'object') {
        const responseObj = exceptionResponse as Record<string, any>;
        message = responseObj.message || responseObj.error || message;

        // Handle class-validator errors
        if (Array.isArray(responseObj.message)) {
          message = responseObj.message[0];
          errors = responseObj.message;
        }

        // Handle technical JSON parsing errors from body-parser
        if (typeof message === 'string' && (message.includes('JSON at position') || message.includes('Unexpected token'))) {
          message = APP_MESSAGES.GENERAL.INVALID_JSON;
        }
      }
    } else if (exception instanceof Error) {
      message = exception.message;

      // Handle raw SyntaxError (like JSON parse errors that might reach here)
      if (exception instanceof SyntaxError && message.includes('JSON')) {
        message = APP_MESSAGES.GENERAL.INVALID_JSON;
        status = HttpStatus.BAD_REQUEST;
      }

      this.logger.error(
        `Unhandled exception: ${exception.message}`,
        exception.stack,
      );
    }

    const errorResponse: any = {
      [SUCCESS_KEY]: false,
      [STATUS_CODE_KEY]: status,
      [MESSAGE_KEY]: message,
      [TIMESTAMP_KEY]: new Date().toISOString(),
      [PATH_KEY]: request.url,
      ...(errors && { [ERRORS_KEY]: errors }),
    };

    response.status(status).json(errorResponse);
  }
}
