import { memo, type ReactNode } from 'react';
import { ButtonLink } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Icon } from '@/components/ui/Icon';
import { Skeleton, SkeletonText } from '@/components/ui/Skeleton';
import type { LoanProductSummary, SavingsProductSummary } from '@/types/products';
import { formatCurrency, formatCurrencyRange, formatPercent } from '@/utils/format';
import { ProductIcon } from './ProductIcon';
import styles from './ProductCard.module.css';

interface Stat {
  label: string;
  value: ReactNode;
  emphasis?: boolean;
}

interface ProductCardProps {
  tone: 'savings' | 'loans';
  icon: SavingsProductSummary['icon'] | LoanProductSummary['icon'];
  name: string;
  description: string;
  stats: Stat[];
  detailsTo: string;
  highlight?: string;
}

/**
 * Shared card layout for savings and loan products. Memoised because product
 * grids re-render as a whole whenever the parent's query state changes, while
 * individual product props stay referentially stable.
 */
const ProductCard = memo(function ProductCard({
  tone,
  icon,
  name,
  description,
  stats,
  detailsTo,
  highlight,
}: ProductCardProps) {
  return (
    <Card as="li" interactive className={styles.card} padding="none" data-testid="product-card">
      <div className={styles.body}>
        <div className={styles.top}>
          <ProductIcon icon={icon} tone={tone} />
          {highlight ? <span className={styles.highlight}>{highlight}</span> : null}
        </div>
        <h3 className={styles.name}>{name}</h3>
        <p className={styles.description}>{description}</p>
        <dl className={styles.stats}>
          {stats.map((stat) => (
            <div key={stat.label} className={styles.stat}>
              <dt>{stat.label}</dt>
              <dd className={stat.emphasis ? styles.emphasis : undefined}>{stat.value}</dd>
            </div>
          ))}
        </dl>
      </div>
      <div className={styles.footer}>
        <ButtonLink
          to={detailsTo}
          variant="secondary"
          fullWidth
          trailingIcon={<Icon name="arrowRight" size={16} />}
          aria-label={`View details for ${name}`}
        >
          View Details
        </ButtonLink>
      </div>
    </Card>
  );
});

export const SavingsProductCard = memo(function SavingsProductCard({
  product,
}: {
  product: SavingsProductSummary;
}) {
  return (
    <ProductCard
      tone="savings"
      icon={product.icon}
      name={product.name}
      description={product.description}
      detailsTo={`/savings/${product.id}`}
      highlight={product.interestRate >= 15 ? 'Best rate' : undefined}
      stats={[
        { label: 'Interest', value: `${formatPercent(product.interestRate)} p.a.`, emphasis: true },
        { label: 'Minimum', value: formatCurrency(product.minimumAmount) },
        { label: 'Duration', value: product.duration },
      ]}
    />
  );
});

export const LoanProductCard = memo(function LoanProductCard({
  product,
}: {
  product: LoanProductSummary;
}) {
  return (
    <ProductCard
      tone="loans"
      icon={product.icon}
      name={product.name}
      description={product.description}
      detailsTo={`/loans/${product.id}`}
      stats={[
        { label: 'Amount', value: formatCurrencyRange(product.minAmount, product.maxAmount, true) },
        { label: 'Tenure', value: product.tenure },
        { label: 'Interest', value: product.interestLabel, emphasis: true },
      ]}
    />
  );
});

export function ProductCardSkeleton() {
  return (
    <li className={`${styles.card} ${styles.skeletonCard}`} aria-hidden="true">
      <div className={styles.body}>
        <Skeleton width="2.75rem" height="2.75rem" radius="var(--radius-md)" />
        <Skeleton width="55%" height="1.25rem" style={{ marginTop: '1rem' }} />
        <SkeletonText lines={2} className={styles.skeletonText} />
        <div className={styles.stats}>
          {[0, 1, 2].map((index) => (
            <div key={index} className={styles.stat}>
              <Skeleton width="60%" height="0.75rem" />
              <Skeleton width="80%" height="1rem" />
            </div>
          ))}
        </div>
      </div>
      <div className={styles.footer}>
        <Skeleton height="2.75rem" radius="var(--radius-md)" />
      </div>
    </li>
  );
}
