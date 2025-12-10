import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status: number;
    let message: string;
    let result: any = null;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      // Handle validation errors and other structured responses
      if (typeof exceptionResponse === 'object' && exceptionResponse !== null) {
        const responseObj = exceptionResponse as any;
        message = responseObj.message || exception.message;

        // If it's a validation error with multiple messages
        if (Array.isArray(responseObj.message)) {
          message = responseObj.message.join(', ');
        }
      } else {
        message = exceptionResponse as string;
      }
    } else if (exception instanceof Error) {
      // Handle non-HTTP errors
      status = HttpStatus.INTERNAL_SERVER_ERROR;
      message = exception.message || 'Internal server error';
      this.logger.error(`Unexpected error: ${exception.message}`, exception.stack);
    } else {
      // Handle unknown errors
      status = HttpStatus.INTERNAL_SERVER_ERROR;
      message = 'An unexpected error occurred';
      this.logger.error('Unknown error type:', exception);
    }

    // Log the error for debugging
    this.logger.warn(
      `HTTP ${status} Error: ${message} | Path: ${request.method} ${request.url}`,
    );

    // Return standardized error response
    response.status(status).json({
      message,
      status,
      result,
    });
  }
}
