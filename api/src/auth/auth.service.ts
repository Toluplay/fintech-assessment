import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { randomUUID } from 'node:crypto';
import { UsersService } from '../users/users.service';
import type { AccessTokenPayload, LoginResponse, RefreshTokenPayload } from './auth.types';

export interface IssuedTokens {
  response: LoginResponse;
  refreshToken: string;
  refreshMaxAgeMs: number;
}

@Injectable()
export class AuthService {
  /**
   * Active refresh sessions (sid -> userId). In production this lives in a
   * database / Redis so refresh tokens can be rotated and revoked server-side.
   */
  private readonly sessions = new Map<string, string>();

  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly config: ConfigService,
  ) {}

  async login(identifier: string, password: string): Promise<IssuedTokens> {
    const user = this.usersService.validateCredentials(identifier, password);
    if (!user) {
      // Deliberately vague: never reveal whether the identifier exists.
      throw new UnauthorizedException('Incorrect email/phone number or password');
    }
    return this.issueTokens(user.id, randomUUID());
  }

  /** Rotates the refresh token: the old session id is revoked and a new one issued. */
  async refresh(refreshToken: string | undefined): Promise<IssuedTokens> {
    if (!refreshToken) throw new UnauthorizedException('No active session');

    let payload: RefreshTokenPayload;
    try {
      payload = await this.jwtService.verifyAsync<RefreshTokenPayload>(refreshToken, {
        secret: this.refreshSecret,
      });
    } catch {
      throw new UnauthorizedException('Session expired');
    }

    if (this.sessions.get(payload.sid) !== payload.sub) {
      throw new UnauthorizedException('Session has been revoked');
    }
    this.sessions.delete(payload.sid);
    return this.issueTokens(payload.sub, randomUUID());
  }

  async logout(refreshToken: string | undefined): Promise<void> {
    if (!refreshToken) return;
    try {
      const payload = await this.jwtService.verifyAsync<RefreshTokenPayload>(refreshToken, {
        secret: this.refreshSecret,
        ignoreExpiration: true,
      });
      this.sessions.delete(payload.sid);
    } catch {
      // Already invalid - nothing to revoke.
    }
  }

  private async issueTokens(userId: string, sessionId: string): Promise<IssuedTokens> {
    const user = this.usersService.findById(userId);
    if (!user) throw new UnauthorizedException('Account no longer exists');

    const accessPayload: AccessTokenPayload = { sub: user.id, email: user.email, roles: user.roles };
    const refreshPayload: RefreshTokenPayload = { sub: user.id, sid: sessionId };
    const accessTtl = this.config.get<string>('JWT_ACCESS_TTL', '15m');
    const refreshTtl = this.config.get<string>('JWT_REFRESH_TTL', '7d');

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(accessPayload, {
        secret: this.accessSecret,
        expiresIn: durationToSeconds(accessTtl),
      }),
      this.jwtService.signAsync(refreshPayload, {
        secret: this.refreshSecret,
        expiresIn: durationToSeconds(refreshTtl),
      }),
    ]);
    this.sessions.set(sessionId, user.id);

    return {
      response: {
        accessToken,
        expiresIn: durationToSeconds(accessTtl),
        user: this.usersService.toPublicUser(user),
      },
      refreshToken,
      refreshMaxAgeMs: durationToSeconds(refreshTtl) * 1000,
    };
  }

  private get accessSecret(): string {
    return this.config.get<string>('JWT_ACCESS_SECRET', 'dev-access-secret-change-me');
  }

  private get refreshSecret(): string {
    return this.config.get<string>('JWT_REFRESH_SECRET', 'dev-refresh-secret-change-me');
  }
}

/** Converts "15m" / "7d" / "3600" style durations to seconds. */
export function durationToSeconds(value: string): number {
  const match = /^(\d+)\s*([smhd]?)$/.exec(value.trim());
  if (!match) return 900;
  const amount = Number(match[1]);
  const multiplier = { '': 1, s: 1, m: 60, h: 3600, d: 86_400 }[match[2]] ?? 1;
  return amount * multiplier;
}
