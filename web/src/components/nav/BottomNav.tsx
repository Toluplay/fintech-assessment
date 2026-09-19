import { NavLink } from 'react-router-dom';
import { Icon } from '@/components/ui/Icon';
import { NAV_ITEMS } from './navItems';
import styles from './BottomNav.module.css';

/** Mobile tab bar (< 768px): thumb-reachable, one tap to every section. */
export function BottomNav() {
  return (
    <nav aria-label="Primary" className={styles.nav}>
      <ul>
        {NAV_ITEMS.map((item) => (
          <li key={item.to}>
            <NavLink
              to={item.to}
              className={({ isActive }) => `${styles.link} ${isActive ? styles.active : ''}`}
            >
              <Icon name={item.icon} size={22} />
              <span>{item.label}</span>
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}
