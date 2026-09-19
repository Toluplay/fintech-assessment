import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { UsersModule } from '../users/users.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

@Module({
  // Secrets are passed per-call in AuthService / JwtAuthGuard, so the module
  // itself needs no static configuration.
  imports: [UsersModule, JwtModule.register({ global: true })],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {}
