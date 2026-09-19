import { useState } from 'react';
import { Navigate, useParams } from 'react-router-dom';
import { ConfirmActionModal } from '@/components/products/ConfirmActionModal';
import {
  ActionCard,
  CheckList,
  DetailHero,
  DetailLayout,
  DetailSkeleton,
  FactGrid,
} from '@/components/products/ProductDetail';
import { Button } from '@/components/ui/Button';
import { ErrorState } from '@/components/ui/ErrorState';
import { Icon } from '@/components/ui/Icon';
import { PageHeader } from '@/components/ui/PageHeader';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { useSavingsProduct, useStartSaving } from '@/hooks/useSavingsProducts';
import { toast } from '@/store/ui.store';
import { formatCurrency, formatPercent } from '@/utils/format';
import { getUserMessage, isApiError } from '@/utils/errors';

export default function SavingsProductDetailPage() {
  const { id = '' } = useParams<{ id: string }>();
  const query = useSavingsProduct(id);
  const startSaving = useStartSaving(id);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const product = query.data;
  useDocumentTitle(product?.name ?? 'Savings product');

  // A product id that does not exist is a genuine 404 - show the not-found page.
  if (query.isError && isApiError(query.error) && query.error.kind === 'not_found') {
    return <Navigate to="/404" replace />;
  }

  const back = { to: '/savings', label: 'All savings products' };

  if (query.isPending && !product) {
    return (
      <div className="page-enter">
        <PageHeader backTo={back} title={<span className="visually-hidden">Loading</span>} />
        <DetailSkeleton />
      </div>
    );
  }

  if (query.isError && !product) {
    return (
      <div className="page-enter">
        <PageHeader backTo={back} title="Savings product" />
        <ErrorState
          title="Unable to load this product."
          message={getUserMessage(query.error)}
          onRetry={() => void query.refetch()}
          retrying={query.isRefetching}
        />
      </div>
    );
  }

  if (!product) return null;
  // Placeholder data comes from the list cache and lacks detail fields.
  const detailLoading = query.isPlaceholderData;

  const handleConfirm = () => {
    startSaving.mutate(undefined, {
      onSuccess: (result) => {
        setConfirmOpen(false);
        toast.success('Savings plan created', result.message);
      },
    });
  };

  return (
    <div className="page-enter">
      <PageHeader backTo={back} title={<span className="visually-hidden">{product.name}</span>} />
      <DetailLayout
        main={
          <>
            <DetailHero
              icon={product.icon}
              tone="savings"
              name={product.name}
              description={product.longDescription ?? product.description}
              loading={detailLoading && !product.longDescription}
            />
            <FactGrid
              loading={detailLoading}
              facts={[
                {
                  label: 'Interest rate',
                  icon: 'trend',
                  value: `${formatPercent(product.interestRate)} p.a.`,
                },
                { label: 'Minimum deposit', icon: 'wallet', value: formatCurrency(product.minimumAmount) },
                {
                  label: 'Maximum deposit',
                  icon: 'wallet',
                  value: detailLoading
                    ? undefined
                    : product.maximumAmount
                      ? formatCurrency(product.maximumAmount)
                      : 'No limit',
                },
                { label: 'Duration', icon: 'clock', value: product.duration },
              ]}
            />
            <CheckList title="Key features" items={detailLoading ? undefined : product.features} />
            <CheckList
              title="Terms & conditions"
              items={detailLoading ? undefined : product.terms}
              icon="info"
              tone="neutral"
            />
          </>
        }
        aside={
          <ActionCard
            title="Ready to start?"
            footnote="Starting a plan is an authenticated action: the request carries your session token and is authorised by the server."
          >
            <p className="text-muted" style={{ fontSize: 'var(--text-sm)' }}>
              Open a {product.name} plan from {formatCurrency(product.minimumAmount)} and earn{' '}
              {formatPercent(product.interestRate)} p.a.
            </p>
            <Button
              size="lg"
              fullWidth
              onClick={() => {
                startSaving.reset();
                setConfirmOpen(true);
              }}
              disabled={detailLoading}
              trailingIcon={<Icon name="arrowRight" size={18} />}
            >
              Start Saving
            </Button>
          </ActionCard>
        }
      />

      <ConfirmActionModal
        open={confirmOpen}
        title={`Start ${product.name}`}
        description="Confirm the plan details below. You can fund the plan after it is created."
        summary={[
          { label: 'Product', value: product.name },
          { label: 'Interest rate', value: `${formatPercent(product.interestRate)} p.a.` },
          { label: 'Minimum deposit', value: formatCurrency(product.minimumAmount) },
          { label: 'Duration', value: product.duration },
        ]}
        confirmLabel="Create plan"
        pendingLabel="Creating plan…"
        pending={startSaving.isPending}
        error={startSaving.isError ? getUserMessage(startSaving.error) : null}
        onConfirm={handleConfirm}
        onClose={() => setConfirmOpen(false)}
      />
    </div>
  );
}
