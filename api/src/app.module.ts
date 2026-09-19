import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { AuthModule } from './auth/auth.module';
import { JwtAuthGuard } from './common/guards/jwt-auth.guard';
import { MockConditionsInterceptor } from './common/interceptors/mock-conditions.interceptor';
import { HealthController } from './health/health.controller';
import { LoanProductsModule } from './loan-products/loan-products.module';
import { SavingsProductsModule } from './savings-products/savings-products.module';
import { UsersModule } from './users/users.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    // Global rate limit: 100 requests / minute per IP. Login has a stricter limit.
    ThrottlerModule.forRoot([{ name: 'default', ttl: 60_000, limit: 100 }]),
    AuthModule,
    UsersModule,
    SavingsProductsModule,
    LoanProductsModule,
  ],
  controllers: [HealthController],
  providers: [
    // Every route requires a valid access token unless explicitly marked @Public().
    // Authorization is enforced here, on the server - never by hiding UI.
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: ThrottlerGuard },
    { provide: APP_INTERCEPTOR, useClass: MockConditionsInterceptor },
  ],
})
export class AppModule {}
