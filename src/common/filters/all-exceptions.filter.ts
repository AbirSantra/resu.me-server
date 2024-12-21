import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { StandardResponse } from '../interfaces/response.interface';
import { HttpAdapterHost } from '@nestjs/core';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  constructor(private readonly httpAdapterHost: HttpAdapterHost) {}

  catch(exception: any, host: ArgumentsHost) {
    const { httpAdapter } = this.httpAdapterHost;

    const ctx = host.switchToHttp();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let errorResponse: Record<string, any> = {};

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const errorRes = exception.getResponse() as Record<string, any>;
      errorResponse = errorRes;
    } else if (exception instanceof Error) {
      // Log error
      console.error(exception);

      errorResponse = {
        message: 'Internal Server Error',
      };
    }

    // Create response object
    const responseBody: StandardResponse = {
      status,
      success: false,
      message: 'Request Failed',
      data: null,
      error: errorResponse,
    };

    // Send response
    httpAdapter.reply(ctx.getResponse(), responseBody, status);
  }
}
