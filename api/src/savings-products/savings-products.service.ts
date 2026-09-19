import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import {
  SAVINGS_PRODUCTS,
  SavingsProduct,
  SavingsProductSummary,
  toSavingsSummary,
} from './savings-products.data';

export interface StartSavingResult {
  planId: string;
  productId: string;
  status: 'pending_funding';
  message: string;
}

@Injectable()
export class SavingsProductsService {
  findAll(): SavingsProductSummary[] {
    return SAVINGS_PRODUCTS.map(toSavingsSummary);
  }

  findOne(id: string): SavingsProduct {
    const product = SAVINGS_PRODUCTS.find((item) => item.id === id);
    if (!product) throw new NotFoundException('Savings product not found');
    return product;
  }

  /**
   * Authenticated action. Ownership (`userId`) comes from the verified token,
   * never from the request body, so a customer cannot act on someone else's behalf.
   */
  startPlan(productId: string, userId: string, amount?: number): StartSavingResult {
    const product = this.findOne(productId);
    if (amount !== undefined && amount < product.minimumAmount) {
      throw new BadRequestException(
        `Minimum deposit for ${product.name} is NGN ${product.minimumAmount.toLocaleString('en-NG')}`,
      );
    }
    return {
      planId: `SP-${userId}-${randomUUID().slice(0, 8).toUpperCase()}`,
      productId,
      status: 'pending_funding',
      message: `Your ${product.name} plan has been created. Fund it to start earning ${product.interestRate}% p.a.`,
    };
  }
}
