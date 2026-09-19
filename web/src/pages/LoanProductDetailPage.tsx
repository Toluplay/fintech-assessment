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
import { useApplyForLoan, useLoanProduct } from '@/hooks/useLoanProducts';
import { toast } from '@/store/ui.store';
import { formatCurrency, formatCurrencyRange } from '@/utils/format';
import { getUserMessage, isApiError } from '@/utils/errors';

export default function LoanProductDetailPage() {
  const { id = '' } = useParams<{ id: string }>();
  const query = useLoanProduct(id);
  const apply = useApplyForLoan(id);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const product = query.data;
  useDocumentTitle(product?.name ?? 'Loan product');

  if (query.isError && isApiError(query.error) && query.error.kind === 'not_found') {
    return <Navigate to="/404" replace />;
  }

  const back = { to: '/loans', label: 'All loan products' };

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
        <PageHeader backTo={back} title="Loan product" />
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
  const detailLoading = query.isPlaceholderData;

  const handleConfirm = () => {
    apply.mutate(undefined, {
      onSuccess: (result) => {
        setConfirmOpen(false);
        toast.success('Application received', result.message);
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
              tone="loans"
              name={product.name}
              description={product.longDescription ?? product.description}
              loading={detailLoading && !product.longDescription}
            />
            <FactGrid
              loading={detailLoading}
              facts={[
                {
                  label: 'Loan range',
                  icon: 'wallet',
                  value: formatCurrencyRange(product.minAmount, product.maxAmount),
                },
                { label: 'Interest rate', icon: 'trend', value: product.interestLabel },
                { label: 'Tenure', icon: 'clock', value: product.tenure },
                {
                  label: 'Disbursement',
                  icon: 'sparkle',
                  value: detailLoading ? undefined : product.disbursement,
                },
              ]}
            />
            <CheckList title="Eligibility" items={detailLoading ? undefined : product.eligibility} />
            <CheckList
              title="Requirements"
              items={detailLoading ? undefined : product.requirements}
              icon="info"
              tone="neutral"
            />
          </>
        }
        aside={
          <ActionCard
            title="Apply in minutes"
            footnote="Applications are tied to your verified identity on the server - the UI cannot apply on behalf of another customer."
          >
            <p className="text-muted" style={{ fontSize: 'var(--text-sm)' }}>
              Borrow between {formatCurrency(product.minAmount)} and {formatCurrency(product.maxAmount)}{' '}
              over {product.tenure}.
            </p>
            <Button
              size="lg"
              fullWidth
              onClick={() => {
                apply.reset();
                setConfirmOpen(true);
              }}
              disabled={detailLoading}
              trailingIcon={<Icon name="arrowRight" size={18} />}
            >
              Apply for Loan
            </Button>
          </ActionCard>
        }
      />

      <ConfirmActionModal
        open={confirmOpen}
        title={`Apply for ${product.name}`}
        description="We will review your application and confirm the final offer before any money moves."
        summary={[
          { label: 'Product', value: product.name },
          { label: 'Loan range', value: formatCurrencyRange(product.minAmount, product.maxAmount, true) },
          { label: 'Interest', value: product.interestLabel },
          { label: 'Tenure', value: product.tenure },
        ]}
        confirmLabel="Submit application"
        pendingLabel="Submitting…"
        pending={apply.isPending}
        error={apply.isError ? getUserMessage(apply.error) : null}
        onConfirm={handleConfirm}
        onClose={() => setConfirmOpen(false)}
      />
    </div>
  );
}
