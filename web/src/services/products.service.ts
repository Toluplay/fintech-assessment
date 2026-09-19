import type {
  LoanApplicationResult,
  LoanProduct,
  LoanProductSummary,
  SavingsProduct,
  SavingsProductSummary,
  StartSavingResult,
} from '@/types/products';
import { http } from './http';

export const savingsService = {
  list: (signal?: AbortSignal) => http.get<SavingsProductSummary[]>('/savings-products', { signal }),
  get: (id: string, signal?: AbortSignal) =>
    http.get<SavingsProduct>(`/savings-products/${encodeURIComponent(id)}`, { signal }),
  start: (id: string, amount?: number) =>
    http.post<StartSavingResult>(
      `/savings-products/${encodeURIComponent(id)}/start`,
      amount ? { amount } : {},
    ),
};

export const loansService = {
  list: (signal?: AbortSignal) => http.get<LoanProductSummary[]>('/loan-products', { signal }),
  get: (id: string, signal?: AbortSignal) =>
    http.get<LoanProduct>(`/loan-products/${encodeURIComponent(id)}`, { signal }),
  apply: (id: string, amount?: number) =>
    http.post<LoanApplicationResult>(
      `/loan-products/${encodeURIComponent(id)}/apply`,
      amount ? { amount } : {},
    ),
};
