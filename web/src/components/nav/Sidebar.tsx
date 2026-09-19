import { NavLink } from 'react-router-dom';
import { Icon } from '@/components/ui/Icon';
import { Logo } from '@/components/ui/Logo';
import type { PublicUser } from '@/types/auth';
import { initials } from '@/utils/format';
import { NAV_ITEMS } from './navItems';
import styles from './Sidebar.module.css';

interface SidebarProps {
  user: PublicUser | null;
  onLogout: () => void;
  loggingOut: boolean;
}

/** Desktop navigation (>= 1024px). */
export function Sidebar({ user, onLogout, loggingOut }: SidebarProps) {
  return (
    <aside className={styles.sidebar}>
      <div className={styles.brand}>
        <Logo tone="light" />
      </div>
      <nav aria-label="Primary" className={styles.nav}>
        <ul>
          {NAV_ITEMS.map((item) => (
            <li key={item.to}>
              <NavLink
                to={item.to}
                className={({ isActive }) => `${styles.link} ${isActive ? styles.active : ''}`}
              >
                <Icon name={item.icon} size={20} />
                <span>{item.label}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
      <div className={styles.footer}>
        {user ? (
          <div className={styles.user}>
            <span className={styles.avatar} aria-hidden="true">
              {initials(user.name)}
            </span>
            <div className={styles.userText}>
              <p className={styles.userName}>{user.name}</p>
              <p className={styles.userEmail}>{user.email}</p>
            </div>
          </div>
        ) : null}
        <button
          type="button"
          className={styles.logout}
          onClick={onLogout}
          disabled={loggingOut}
          aria-busy={loggingOut || undefined}
        >
          <Icon name="logout" size={18} />
          <span>{loggingOut ? 'Signing out…' : 'Logout'}</span>
        </button>
      </div>
    </aside>
  );
}
