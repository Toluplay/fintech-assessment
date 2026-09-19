import { ProductGridSkeleton } from '@/components/products/ProductGrid';
import { Skeleton } from './Skeleton';
import styles from './PageSkeleton.module.css';

/** Route-level fallback while a lazily loaded page chunk downloads. */
export function PageSkeleton() {
  return (
    <div className={styles.page} data-testid="page-skeleton">
      <div className={styles.header} aria-hidden="true">
        <Skeleton width="40%" height="2rem" />
        <Skeleton width="60%" height="1rem" />
      </div>
      <ProductGridSkeleton label="Loading page…" />
    </div>
  );
}
