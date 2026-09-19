import {
  CallHandler,
  ExecutionContext,
  HttpException,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { Request } from 'express';
import { Observable, delay, throwError, timer } from 'rxjs';
import { mergeMap } from 'rxjs/operators';

/**
 * Development-only helpers for a mock API:
 *  - adds artificial latency so loading states are visible
 *  - `X-Simulate-Status: 500` (or `?simulate=500`) forces an error response so
 *    error handling can be demonstrated without breaking the server.
 * Both are disabled when NODE_ENV=production.
 */
@Injectable()
export class MockConditionsInterceptor implements NestInterceptor {
  constructor(private readonly config: ConfigService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    if (this.config.get('NODE_ENV') === 'production') return next.handle();

    const request = context.switchToHttp().getRequest<Request>();
    const latency = Number(this.config.get('MOCK_LATENCY_MS', 600));
    const simulated = Number(
      request.headers['x-simulate-status'] ?? (request.query.simulate as string) ?? 0,
    );

    if (simulated >= 400 && simulated <= 599) {
      return timer(latency).pipe(
        mergeMap(() =>
          throwError(() => new HttpException(`Simulated ${simulated} error`, simulated)),
        ),
      );
    }

    return next.handle().pipe(delay(latency));
  }
}
