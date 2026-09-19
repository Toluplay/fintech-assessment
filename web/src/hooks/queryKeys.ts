/**
 * Central query-key factory. Keys are hierarchical so invalidating
 * `queryKeys.savings.all` also drops every savings detail query.
 */
export const queryKeys = {
  me: ['me'] as const,
  savings: {
    all: ['savings-products'] as const,
    detail: (id: string) => ['savings-products', id] as const,
  },
  loans: {
    all: ['loan-products'] as const,
    detail: (id: string) => ['loan-products', id] as const,
  },
};
