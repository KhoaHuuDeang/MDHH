import { HttpStatus } from '@nestjs/common';

export interface ApiResponse<T = any> {
  message: string;
  status: HttpStatus;
  result?: T;
}

export class ResponseHelper {
  static success<T>(
    message: string,
    result?: T,
    status: HttpStatus = HttpStatus.OK,
  ): ApiResponse<T> {
    return {
      message,
      status,
      result,
    };
  }

  static created<T>(message: string, result?: T): ApiResponse<T> {
    return {
      message,
      status: HttpStatus.CREATED,
      result,
    };
  }

  static error(
    message: string,
    status: HttpStatus = HttpStatus.INTERNAL_SERVER_ERROR,
  ): ApiResponse<null> {
    return {
      message,
      status,
      result: null,
    };
  }

  static badRequest(message: string): ApiResponse<null> {
    return {
      message,
      status: HttpStatus.BAD_REQUEST,
      result: null,
    };
  }

  static unauthorized(message: string): ApiResponse<null> {
    return {
      message,
      status: HttpStatus.UNAUTHORIZED,
      result: null,
    };
  }

  static forbidden(message: string): ApiResponse<null> {
    return {
      message,
      status: HttpStatus.FORBIDDEN,
      result: null,
    };
  }

  static notFound(message: string): ApiResponse<null> {
    return {
      message,
      status: HttpStatus.NOT_FOUND,
      result: null,
    };
  }

  static conflict(message: string): ApiResponse<null> {
    return {
      message,
      status: HttpStatus.CONFLICT,
      result: null,
    };
  }
}
