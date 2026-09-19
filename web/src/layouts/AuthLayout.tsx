import { Suspense } from 'react';
import { Outlet } from 'react-router-dom';
import { Icon, type IconName } from '@/components/ui/Icon';
import { Logo } from '@/components/ui/Logo';
import { Skeleton } from '@/components/ui/Skeleton';
import styles from './AuthLayout.module.css';

const TRUST_POINTS: { icon: IconName; title: string; text: string }[] = [
  {
    icon: 'shield',
    title: 'Bank-grade security',
    text: 'Your session is protected with short-lived tokens and encrypted connections.',
  },
  {
    icon: 'trend',
    title: 'Up to 18% p.a. on savings',
    text: 'Grow your money with fixed, flexible or goal-based plans.',
  },
  {
    icon: 'clock',
    title: 'Loans in 24 hours',
    text: 'Transparent rates and instant decisions for salaried customers.',
  },
];

/** Split layout for unauthenticated screens: brand panel + form. */
export function AuthLayout() {
  return (
    <div className={styles.layout}>
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>
      <aside className={styles.panel} aria-label="About Veridian">
        <Logo tone="light" size="lg" />
        <div className={styles.panelBody}>
          <h2 className={styles.panelTitle}>Savings and loans built on trust.</h2>
          <ul className={styles.points}>
            {TRUST_POINTS.map((point) => (
              <li key={point.title} className={styles.point}>
                <span className={styles.pointIcon}>
                  <Icon name={point.icon} size={20} />
                </span>
                <div>
                  <p className={styles.pointTitle}>{point.title}</p>
                  <p className={styles.pointText}>{point.text}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
        <p className={styles.legal}>Veridian is licensed and deposits are insured by the NDIC.</p>
      </aside>
      <main id="main-content" className={styles.main} tabIndex={-1}>
        <div className={styles.mobileLogo}>
          <Logo />
        </div>
        <Suspense
          fallback={
            <div className={styles.fallback} role="status" aria-label="Loading">
              <Skeleton width="60%" height="2rem" />
              <Skeleton height="3rem" radius="var(--radius-md)" />
              <Skeleton height="3rem" radius="var(--radius-md)" />
            </div>
          }
        >
          <Outlet />
        </Suspense>
      </main>
    </div>
  );
}
