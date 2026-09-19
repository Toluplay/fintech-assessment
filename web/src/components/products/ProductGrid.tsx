import type { ReactNode } from 'react';
import { ProductCardSkeleton } from './ProductCard';
import styles from './ProductGrid.module.css';

interface ProductGridProps {
  children: ReactNode;
  'aria-label': string;
}

export function ProductGrid({ children, ...rest }: ProductGridProps) {
  return (
    <ul className={styles.grid} {...rest}>
      {children}
    </ul>
  );
}

interface ProductGridSkeletonProps {
  count?: number;
  label: string;
}

/** Skeleton grid with a screen-reader-only status message. */
export function ProductGridSkeleton({ count = 3, label }: ProductGridSkeletonProps) {
  return (
    <div role="status" aria-live="polite" data-testid="product-grid-skeleton">
      <p className="visually-hidden">{label}</p>
      <ul className={styles.grid} aria-hidden="true">
        {Array.from({ length: count }, (_, index) => (
          <ProductCardSkeleton key={index} />
        ))}
      </ul>
    </div>
  );
}
