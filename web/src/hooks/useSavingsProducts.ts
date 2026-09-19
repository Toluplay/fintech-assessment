import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { savingsService } from '@/services/products.service';
import type { SavingsProduct, SavingsProductSummary } from '@/types/products';
import { queryKeys } from './queryKeys';

export function useSavingsProducts() {
  return useQuery({
    queryKey: queryKeys.savings.all,
    queryFn: ({ signal }) => savingsService.list(signal),
  });
}

/**
 * Detail query. If the list is already cached, the matching summary is used
 * as placeholder data so the header renders instantly while the full record
 * (features, terms) streams in - no blank screen on navigation.
 */
export function useSavingsProduct(id: string) {
  const queryClient = useQueryClient();
  return useQuery<SavingsProduct>({
    queryKey: queryKeys.savings.detail(id),
    queryFn: ({ signal }) => savingsService.get(id, signal),
    placeholderData: () => {
      const summary = queryClient
        .getQueryData<SavingsProductSummary[]>(queryKeys.savings.all)
        ?.find((item) => item.id === id);
      return summary ? ({ ...summary } as SavingsProduct) : undefined;
    },
  });
}

export function useStartSaving(productId: string) {
  return useMutation({
    mutationFn: (amount?: number) => savingsService.start(productId, amount),
  });
}
