import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { loansService } from '@/services/products.service';
import type { LoanProduct, LoanProductSummary } from '@/types/products';
import { queryKeys } from './queryKeys';

export function useLoanProducts() {
  return useQuery({
    queryKey: queryKeys.loans.all,
    queryFn: ({ signal }) => loansService.list(signal),
  });
}

export function useLoanProduct(id: string) {
  const queryClient = useQueryClient();
  return useQuery<LoanProduct>({
    queryKey: queryKeys.loans.detail(id),
    queryFn: ({ signal }) => loansService.get(id, signal),
    placeholderData: () => {
      const summary = queryClient
        .getQueryData<LoanProductSummary[]>(queryKeys.loans.all)
        ?.find((item) => item.id === id);
      return summary ? ({ ...summary } as LoanProduct) : undefined;
    },
  });
}

export function useApplyForLoan(productId: string) {
  return useMutation({
    mutationFn: (amount?: number) => loansService.apply(productId, amount),
  });
}
