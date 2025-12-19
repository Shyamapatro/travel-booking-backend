import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiResponse } from '../interfaces/api-response.interface';
import { RESPONSE_MESSAGE } from '../decorators/response.decorator';
import {
  APP_MESSAGES,
  RESPONSE_KEYS,
  SUCCESS_KEY,
  STATUS_CODE_KEY,
  MESSAGE_KEY,
  DATA_KEY,
  TIMESTAMP_KEY,
  PATH_KEY
} from '../constants';

@Injectable()
export class TransformInterceptor<T>
  implements NestInterceptor<T, ApiResponse<T>> {
  constructor(private reflector: Reflector) { }

  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<ApiResponse<T>> {
    const ctx = context.switchToHttp();
    const response = ctx.getResponse();
    const request = ctx.getRequest();

    const message =
      this.reflector.getAllAndOverride<string>(RESPONSE_MESSAGE, [
        context.getHandler(),
        context.getClass(),
      ]) || APP_MESSAGES.GENERAL.SUCCESS;

    return next.handle().pipe(
      map((data) => {
        // If data already has our response structure, return as is
        if (data && typeof data === 'object' && SUCCESS_KEY in data && STATUS_CODE_KEY in data) {
          return data;
        }

        // Extract message and data
        let finalMessage = message;
        let responseData = data;

        if (data && typeof data === 'object') {
          if (MESSAGE_KEY in data && DATA_KEY in data) {
            finalMessage = data[MESSAGE_KEY];
            responseData = data[DATA_KEY];
          } else if (MESSAGE_KEY in data) {
            // If only message is present, check if it has other fields
            const { [MESSAGE_KEY]: msg, ...rest } = data;
            if (Object.keys(rest).length > 0) {
              finalMessage = msg as string;
              responseData = rest;
            } else {
              finalMessage = msg as string;
              responseData = undefined;
            }
          }
        }

        return {
          [SUCCESS_KEY]: true,
          [STATUS_CODE_KEY]: response.statusCode,
          [MESSAGE_KEY]: finalMessage,
          [DATA_KEY]: responseData || data,
          [TIMESTAMP_KEY]: new Date().toISOString(),
          [PATH_KEY]: request.url,
        } as any;
      }),
    );
  }
}
