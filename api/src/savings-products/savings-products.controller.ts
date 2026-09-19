import { Body, Controller, Get, HttpCode, HttpStatus, Param, Post } from '@nestjs/common';
import { IsInt, IsOptional, Min } from 'class-validator';
import type { AccessTokenPayload } from '../auth/auth.types';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { SavingsProductsService } from './savings-products.service';

export class StartSavingDto {
  @IsOptional()
  @IsInt()
  @Min(1)
  amount?: number;
}

@Controller('savings-products')
export class SavingsProductsController {
  constructor(private readonly savingsProductsService: SavingsProductsService) {}

  @Get()
  findAll() {
    return this.savingsProductsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.savingsProductsService.findOne(id);
  }

  @Post(':id/start')
  @HttpCode(HttpStatus.CREATED)
  start(
    @Param('id') id: string,
    @Body() dto: StartSavingDto,
    @CurrentUser() user: AccessTokenPayload,
  ) {
    return this.savingsProductsService.startPlan(id, user.sub, dto.amount);
  }
}
