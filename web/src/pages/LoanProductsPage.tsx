import { LoanProductCard } from '@/components/products/ProductCard';
import { ProductGrid, ProductGridSkeleton } from '@/components/products/ProductGrid';
import { ErrorState } from '@/components/ui/ErrorState';
import { PageHeader } from '@/components/ui/PageHeader';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { useLoanProducts } from '@/hooks/useLoanProducts';
import { getUserMessage } from '@/utils/errors';

export default function LoanProductsPage() {
  useDocumentTitle('Loans');
  const { data, isPending, isError, error, refetch, isRefetching } = useLoanProducts();

  return (
    <div className="page-enter">
      <PageHeader
        eyebrow="Loans"
        title="Loan products"
        description="Transparent pricing, fast decisions. Choose the loan that matches your needs."
      />

      {isPending ? (
        <ProductGridSkeleton label="Loading loan products…" />
      ) : isError ? (
        <ErrorState
          title="Unable to load loan products."
          message={getUserMessage(error)}
          onRetry={() => void refetch()}
          retrying={isRefetching}
        />
      ) : (
        <ProductGrid aria-label="Loan products">
          {data.map((product) => (
            <LoanProductCard key={product.id} product={product} />
          ))}
        </ProductGrid>
      )}
    </div>
  );
}
