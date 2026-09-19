import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import type { Request } from 'express';

/**
 * Cookie-authenticated endpoints (refresh / logout) require a custom header.
 * Browsers only attach custom headers to requests that pass a CORS preflight,
 * so a cross-site <form> or <img> cannot forge them. Combined with a
 * SameSite=Strict cookie this gives defence in depth against CSRF.
 */
@Injectable()
export class CsrfHeaderGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    if (request.headers['x-requested-with'] !== 'XMLHttpRequest') {
      throw new ForbiddenException('Missing CSRF header');
    }
    return true;
  }
}
