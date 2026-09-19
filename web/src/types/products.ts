export type SavingsIcon = 'target' | 'flex' | 'lock';
export type LoanIcon = 'person' | 'salary' | 'business';

export interface SavingsProductSummary {
  id: string;
  name: string;
  /** Annual rate in percent. */
  interestRate: number;
  minimumAmount: number;
  duration: string;
  description: string;
  icon: SavingsIcon;
  currency: 'NGN';
}

export interface SavingsProduct extends SavingsProductSummary {
  maximumAmount: number | null;
  longDescription: string;
  features: string[];
  terms: string[];
}

export interface LoanProductSummary {
  id: string;
  name: string;
  minAmount: number;
  maxAmount: number;
  /** Monthly rate in percent, or null when priced per application. */
  interestRate: number | null;
  interestLabel: string;
  tenure: string;
  description: string;
  icon: LoanIcon;
  currency: 'NGN';
}

export interface LoanProduct extends LoanProductSummary {
  longDescription: string;
  eligibility: string[];
  requirements: string[];
  disbursement: string;
}

export interface StartSavingResult {
  planId: string;
  productId: string;
  status: 'pending_funding';
  message: string;
}

export interface LoanApplicationResult {
  applicationId: string;
  productId: string;
  status: 'under_review';
  message: string;
}
