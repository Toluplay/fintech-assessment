import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import type { Request, Response } from 'express';

export interface ApiErrorBody {
  statusCode: number;
  error: string;
  message: string;
  details?: string[];
}

/**
 * Normalises every error into one predictable JSON shape and makes sure
 * internal details (stack traces, ORM errors, secrets) never reach the client.
 */
@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status: number = HttpStatus.INTERNAL_SERVER_ERROR;
    let body: ApiErrorBody = {
      statusCode: status,
      error: 'Internal Server Error',
      message: 'Something went wrong on our side. Please try again.',
    };

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const raw = exception.getResponse();
      const rawMessage =
        typeof raw === 'object' && raw !== null
          ? (raw as { message?: string | string[] }).message
          : raw;
      const details = Array.isArray(rawMessage) ? rawMessage.map(String) : undefined;
      body = {
        statusCode: status,
        error: exception.name.replace(/Exception$/, ''),
        message: details ? 'Validation failed' : String(rawMessage ?? exception.message),
        ...(details ? { details } : {}),
      };
    } else {
      // Log the real error server-side only. Never echo it to the client.
      this.logger.error(
        `Unhandled error on ${request.method} ${request.url}`,
        exception instanceof Error ? exception.stack : String(exception),
      );
    }

    response.status(status).json(body);
  }
}
