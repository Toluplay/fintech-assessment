import { useCallback } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { LoginForm } from '@/components/auth/LoginForm';
import { Icon } from '@/components/ui/Icon';
import { useAuth } from '@/hooks/useAuth';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import type { LoginRequest } from '@/types/auth';
import styles from './LoginPage.module.css';

export default function LoginPage() {
  useDocumentTitle('Log in');
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

      <LoginForm onSubmit={handleLogin} />

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

      <details className={styles.demo}>
        <summary>Demo credentials</summary>
        <dl>
          <div>
            <dt>Email</dt>
            <dd>john@example.com</dd>
          </div>
          <div>
            <dt>Password</dt>
            <dd>Password123!</dd>
          </div>
        </dl>
      </details>
    </div>
  );
}
