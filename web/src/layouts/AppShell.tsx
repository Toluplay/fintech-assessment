import { Suspense, useCallback, useState } from 'react';
import { Outlet } from 'react-router-dom';
import { BottomNav } from '@/components/nav/BottomNav';
import { Sidebar } from '@/components/nav/Sidebar';
import { TopBar } from '@/components/nav/TopBar';
import { PageSkeleton } from '@/components/ui/PageSkeleton';
import { useAuth } from '@/hooks/useAuth';
import styles from './AppShell.module.css';

/**
 * Authenticated application frame: persistent navigation around a routed
 * <main>. The Suspense boundary here means switching pages only swaps the
 * content area - the navigation never flashes while a lazy route loads.
 */
export function AppShell() {
  const { user, logout } = useAuth();
  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogout = useCallback(async () => {
    setLoggingOut(true);
    try {
      await logout();
    } finally {
      setLoggingOut(false);
    }
  }, [logout]);

  return (
    <div className={styles.shell}>
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>
      <Sidebar user={user} onLogout={handleLogout} loggingOut={loggingOut} />
      <div className={styles.column}>
        <TopBar user={user} onLogout={handleLogout} loggingOut={loggingOut} />
        <main id="main-content" className={styles.main} tabIndex={-1}>
          <div className={`container ${styles.content}`}>
            <Suspense fallback={<PageSkeleton />}>
              <Outlet />
            </Suspense>
          </div>
        </main>
      </div>
      <BottomNav />
    </div>
  );
}
