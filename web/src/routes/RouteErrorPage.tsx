import { isRouteErrorResponse, Link, useRouteError } from 'react-router-dom';
import { ButtonLink } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import styles from './RouteErrorPage.module.css';

/**
 * Catches render errors and failed lazy imports (e.g. a stale chunk after a
 * deploy). Nothing technical is shown - the details are only logged in dev.
 */
export function RouteErrorPage() {
  const error = useRouteError();
  const notFound = isRouteErrorResponse(error) && error.status === 404;

  if (import.meta.env.DEV) {
    console.error(error);
  }

  return (
    <main className={styles.page} id="main-content">
      <span className={styles.icon}>
        <Icon name="alert" size={26} />
      </span>
      <h1 className={styles.title}>{notFound ? 'Page not found' : 'Something went wrong'}</h1>
      <p className={styles.text}>
        {notFound
          ? 'The page you are looking for does not exist or has moved.'
          : 'We could not load this page. Please try again, and if the problem continues, contact support.'}
      </p>
      <div className={styles.actions}>
        {!notFound ? (
          <button type="button" className={styles.reload} onClick={() => window.location.reload()}>
            <Icon name="refresh" size={16} /> Reload page
          </button>
        ) : null}
        <ButtonLink to="/dashboard" variant="primary">
          Go to dashboard
        </ButtonLink>
      </div>
      <Link to="/login" className={styles.link}>
        Sign in with a different account
      </Link>
    </main>
  );
}
