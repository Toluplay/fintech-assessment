import { Link, NavLink } from 'react-router-dom';
import { Icon } from '@/components/ui/Icon';
import { Logo } from '@/components/ui/Logo';
import type { PublicUser } from '@/types/auth';
import { initials } from '@/utils/format';
import { NAV_ITEMS } from './navItems';
import styles from './TopBar.module.css';

interface TopBarProps {
  user: PublicUser | null;
  onLogout: () => void;
  loggingOut: boolean;
}

/**
 * Header for tablet and mobile (< 1024px). On tablet it carries inline
 * navigation; on mobile the links move to the bottom tab bar.
 */
export function TopBar({ user, onLogout, loggingOut }: TopBarProps) {
  return (
    <header className={styles.bar}>
      <Link to="/dashboard" className={styles.logo} aria-label="Veridian dashboard">
        <Logo size="sm" />
      </Link>
      <nav aria-label="Primary" className={styles.tabletNav}>
        <ul>
          {NAV_ITEMS.map((item) => (
            <li key={item.to}>
              <NavLink
                to={item.to}
                className={({ isActive }) => `${styles.link} ${isActive ? styles.active : ''}`}
              >
                {item.label}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
      <div className={styles.right}>
        {user ? (
          <Link to="/profile" className={styles.avatar} aria-label={`Profile: ${user.name}`}>
            {initials(user.name)}
          </Link>
        ) : null}
        <button
          type="button"
          className={styles.logout}
          onClick={onLogout}
          disabled={loggingOut}
          aria-busy={loggingOut || undefined}
          aria-label="Logout"
          title="Logout"
        >
          <Icon name="logout" size={20} />
        </button>
      </div>
    </header>
  );
}
