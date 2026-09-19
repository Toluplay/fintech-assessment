import { ButtonLink } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import styles from './NotFoundPage.module.css';

export default function NotFoundPage() {
  useDocumentTitle('Page not found');
  return (
    <div className={`${styles.page} page-enter`}>
      <span className={styles.icon}>
        <Icon name="info" size={26} />
      </span>
      <h1 className={styles.title}>We could not find that page</h1>
      <p className={styles.text}>
        The link may be out of date, or the product you were looking for is no longer available.
      </p>
      <div className={styles.actions}>
        <ButtonLink to="/dashboard">Go to dashboard</ButtonLink>
        <ButtonLink to="/savings" variant="secondary">
          Browse savings
        </ButtonLink>
      </div>
    </div>
  );
}
