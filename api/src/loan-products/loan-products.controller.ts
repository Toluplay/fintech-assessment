import { Body, Controller, Get, HttpCode, HttpStatus, Param, Post } from '@nestjs/common';
import { IsInt, IsOptional, Min } from 'class-validator';
import type { AccessTokenPayload } from '../auth/auth.types';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { LoanProductsService } from './loan-products.service';

export class ApplyForLoanDto {
  @IsOptional()
  @IsInt()
  @Min(1)
  amount?: number;
}

@Controller('loan-products')
export class LoanProductsController {
  constructor(private readonly loanProductsService: LoanProductsService) {}

  @Get()
  findAll() {
    return this.loanProductsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.loanProductsService.findOne(id);
  }

  @Post(':id/apply')
  @HttpCode(HttpStatus.CREATED)
  apply(
    @Param('id') id: string,
    @Body() dto: ApplyForLoanDto,
    @CurrentUser() user: AccessTokenPayload,
  ) {
    return this.loanProductsService.apply(id, user.sub, dto.amount);
  }
}
