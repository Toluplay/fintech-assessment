import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { LOAN_PRODUCTS, LoanProduct, LoanProductSummary, toLoanSummary } from './loan-products.data';

export interface LoanApplicationResult {
  applicationId: string;
  productId: string;
  status: 'under_review';
  message: string;
}

@Injectable()
export class LoanProductsService {
  findAll(): LoanProductSummary[] {
    return LOAN_PRODUCTS.map(toLoanSummary);
  }

  findOne(id: string): LoanProduct {
    const product = LOAN_PRODUCTS.find((item) => item.id === id);
    if (!product) throw new NotFoundException('Loan product not found');
    return product;
  }

  /** Authenticated action - the applicant is always the token subject. */
  apply(productId: string, userId: string, amount?: number): LoanApplicationResult {
    const product = this.findOne(productId);
    if (amount !== undefined && (amount < product.minAmount || amount > product.maxAmount)) {
      throw new BadRequestException(
        `${product.name} amounts must be between NGN ${product.minAmount.toLocaleString('en-NG')} and NGN ${product.maxAmount.toLocaleString('en-NG')}`,
      );
    }
    return {
      applicationId: `LN-${userId}-${randomUUID().slice(0, 8).toUpperCase()}`,
      productId,
      status: 'under_review',
      message: `Your ${product.name} application has been received. We will get back to you within one working day.`,
    };
  }
}
