import { QueryClient } from '@tanstack/react-query';
import { isApiError } from '@/utils/errors';

/**
 * Server-state cache configuration.
 *
 * Product catalogues change rarely, so data is considered fresh for 5 minutes:
 * navigating Savings -> Dashboard -> Savings reuses the cache instead of
 * calling GET /savings-products again. Failed requests retry only for
 * transient failures (network / 5xx), never for 4xx which will not fix
 * themselves.
 */
export function createQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 5 * 60 * 1000,
        gcTime: 30 * 60 * 1000,
        refetchOnWindowFocus: false,
        retry: (failureCount, error) => {
          if (isApiError(error) && (error.kind === 'network' || error.kind === 'server')) {
            return failureCount < 2;
          }
          return false;
        },
        retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 4000),
      },
      mutations: {
        retry: false,
      },
    },
  });
}
