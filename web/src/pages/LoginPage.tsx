import { useCallback, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { LoginForm } from '@/components/auth/LoginForm';
import { Icon } from '@/components/ui/Icon';
import { useAuth } from '@/hooks/useAuth';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import type { LoginRequest } from '@/types/auth';
import type { LoginFormValues } from '@/utils/validation';
import styles from './LoginPage.module.css';

/** Seeded demo account (see api/src/users/users.data.ts). */
const DEMO_ACCOUNT: LoginFormValues = { identifier: 'john@example.com', password: 'Password123!' };

export default function LoginPage() {
  useDocumentTitle('Log in');
  const [prefill, setPrefill] = useState<LoginFormValues | null>(null);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: string } | null)?.from;

  const handleLogin = useCallback(
    async (credentials: LoginRequest) => {
      await login(credentials);
      navigate(from ?? '/dashboard', { replace: true });
    },
    [from, login, navigate],
  );

  return (
    <div className={`${styles.card} page-enter`}>
      <header className={styles.header}>
        <h1 className={styles.title}>Welcome back</h1>
        <p className={styles.subtitle}>Log in to manage your savings and loans.</p>
      </header>

      <LoginForm onSubmit={handleLogin} prefill={prefill} />

      <div className={styles.links}>
        <Link to="/forgot-password" className={styles.link}>
          Forgot password?
        </Link>
        <p className={styles.register}>
          Don&apos;t have an account?{' '}
          <Link to="/register" className={styles.link}>
            Create one
          </Link>
        </p>
      </div>

      <p className={styles.secure}>
        <Icon name="lock" size={14} />
        Your connection to Veridian is encrypted.
      </p>

      <aside className={styles.demo} aria-labelledby="demo-title">
        <div className={styles.demoText}>
          <p id="demo-title" className={styles.demoTitle}>
            <Icon name="sparkle" size={14} /> Demo account
          </p>
          <p className={styles.demoCreds}>
            <code>{DEMO_ACCOUNT.identifier}</code> · <code>{DEMO_ACCOUNT.password}</code>
          </p>
        </div>
        <button
          type="button"
          className={styles.demoButton}
          // A new object each click so the form refills even after edits.
          onClick={() => setPrefill({ ...DEMO_ACCOUNT })}
        >
          Use demo account
        </button>
      </aside>
    </div>
  );
}
