import { SavingsProductCard } from '@/components/products/ProductCard';
import { ProductGrid, ProductGridSkeleton } from '@/components/products/ProductGrid';
import { ErrorState } from '@/components/ui/ErrorState';
import { PageHeader } from '@/components/ui/PageHeader';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { useSavingsProducts } from '@/hooks/useSavingsProducts';
import { getUserMessage } from '@/utils/errors';

export default function SavingsProductsPage() {
  useDocumentTitle('Savings');
  const { data, isPending, isError, error, refetch, isRefetching } = useSavingsProducts();

  return (
    <div className="page-enter">
      <PageHeader
        eyebrow="Savings"
        title="Savings products"
        description="Pick a plan that fits your goal - lock in our best rates or keep your money flexible."
      />

      {isPending ? (
        <ProductGridSkeleton label="Loading savings products…" />
      ) : isError ? (
        <ErrorState
          title="Unable to load savings products."
          message={getUserMessage(error)}
          onRetry={() => void refetch()}
          retrying={isRefetching}
        />
      ) : (
        <ProductGrid aria-label="Savings products">
          {data.map((product) => (
            <SavingsProductCard key={product.id} product={product} />
          ))}
        </ProductGrid>
      )}
    </div>
  );
}
