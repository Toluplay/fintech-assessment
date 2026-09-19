import { useLocation } from 'react-router-dom';
import { ButtonLink } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import styles from './ComingSoonPage.module.css';

/** Placeholder for flows that are out of scope (registration, password reset). */
export default function ComingSoonPage() {
  const { pathname } = useLocation();
  const isRegister = pathname.includes('register');
  const title = isRegister ? 'Create an account' : 'Reset your password';
  useDocumentTitle(title);

  return (
    <div className={`${styles.card} page-enter`}>
      <span className={styles.icon}>
        <Icon name="sparkle" size={24} />
      </span>
      <h1 className={styles.title}>{title}</h1>
      <p className={styles.text}>
        {isRegister
          ? 'Self-service onboarding is coming soon. In the meantime, use the demo credentials on the login page.'
          : 'Password reset is coming soon. In the meantime, use the demo credentials on the login page.'}
      </p>
      <ButtonLink to="/login" variant="secondary" leadingIcon={<Icon name="arrowLeft" size={16} />}>
        Back to login
      </ButtonLink>
    </div>
  );
}
