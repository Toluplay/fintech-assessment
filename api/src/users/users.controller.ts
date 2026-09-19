import { Controller, Get, NotFoundException } from '@nestjs/common';
import type { AccessTokenPayload } from '../auth/auth.types';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  getMe(@CurrentUser() current: AccessTokenPayload) {
    const user = this.usersService.findById(current.sub);
    if (!user) throw new NotFoundException('User not found');
    return this.usersService.toProfile(user);
  }
}
