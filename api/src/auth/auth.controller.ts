import { Body, Controller, HttpCode, HttpStatus, Post, Req, Res, UseGuards } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Throttle } from '@nestjs/throttler';
import type { CookieOptions, Request, Response } from 'express';
import { Public } from '../common/decorators/public.decorator';
import { CsrfHeaderGuard } from '../common/guards/csrf-header.guard';
import { AuthService } from './auth.service';
import type { LoginResponse } from './auth.types';
import { LoginDto } from './dto/login.dto';

export const REFRESH_COOKIE = 'vf_refresh';
/** Login attempts per minute per IP. Raised only for automated test runs. */
const LOGIN_RATE_LIMIT = Number(process.env.LOGIN_RATE_LIMIT ?? 5);

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly config: ConfigService,
  ) {}

  /**
   * Returns a short-lived access token in the body (kept in memory by the SPA)
   * and sets a long-lived refresh token as an HttpOnly cookie that JavaScript
   * can never read - so an XSS bug cannot exfiltrate a durable credential.
   */
  @Public()
  @Throttle({ default: { limit: LOGIN_RATE_LIMIT, ttl: 60_000 } }) // brute-force protection
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(
    @Body() dto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<LoginResponse> {
    const issued = await this.authService.login(dto.identifier, dto.password);
    res.cookie(REFRESH_COOKIE, issued.refreshToken, this.cookieOptions(issued.refreshMaxAgeMs));
    return issued.response;
  }

  @Public()
  @UseGuards(CsrfHeaderGuard)
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refresh(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<LoginResponse> {
    const issued = await this.authService.refresh(this.readRefreshCookie(req));
    res.cookie(REFRESH_COOKIE, issued.refreshToken, this.cookieOptions(issued.refreshMaxAgeMs));
    return issued.response;
  }

  @Public()
  @UseGuards(CsrfHeaderGuard)
  @Post('logout')
  @HttpCode(HttpStatus.NO_CONTENT)
  async logout(@Req() req: Request, @Res({ passthrough: true }) res: Response): Promise<void> {
    await this.authService.logout(this.readRefreshCookie(req));
    res.clearCookie(REFRESH_COOKIE, this.cookieOptions(0));
  }

  private readRefreshCookie(req: Request): string | undefined {
    const cookies = (req as Request & { cookies?: Record<string, string> }).cookies;
    return cookies?.[REFRESH_COOKIE];
  }

  private cookieOptions(maxAge: number): CookieOptions {
    return {
      httpOnly: true, // not readable from JavaScript
      secure: this.config.get('NODE_ENV') === 'production', // HTTPS only in production
      sameSite: 'strict', // never sent on cross-site requests -> CSRF protection
      path: '/', // scoped further to /auth in production (see README)
      maxAge,
    };
  }
}
