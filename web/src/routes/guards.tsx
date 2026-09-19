import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { Logo } from '@/components/ui/Logo';
import { selectStatus, useAuthStore } from '@/store/auth.store';
import styles from './guards.module.css';

/** Shown for the brief moment the boot-time session refresh is in flight. */
function SessionSplash() {
  return (
    <div className={styles.splash} role="status" aria-live="polite">
      <Logo size="lg" />
      <p className={styles.splashText}>Restoring your session…</p>
    </div>
  );
}

/**
 * Wraps every authenticated route. Unauthenticated visitors are redirected to
 * /login and, after signing in, returned to the page they wanted.
 *
 * This is a UX guard only - the API independently rejects requests without a
 * valid token, so bypassing this component gains nothing.
 */
export function RequireAuth() {
  const status = useAuthStore(selectStatus);
  const location = useLocation();

  if (status === 'unknown') return <SessionSplash />;
  if (status === 'anonymous') {
    return <Navigate to="/login" replace state={{ from: location.pathname + location.search }} />;
  }
  return <Outlet />;
}

/** Login & co: already-authenticated users are sent straight to the app. */
export function RedirectIfAuthenticated() {
  const status = useAuthStore(selectStatus);
  const location = useLocation();
  const from = (location.state as { from?: string } | null)?.from;

  if (status === 'authenticated') return <Navigate to={from ?? '/dashboard'} replace />;
  return <Outlet />;
}
