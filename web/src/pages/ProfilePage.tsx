import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { ErrorState } from '@/components/ui/ErrorState';
import { Icon } from '@/components/ui/Icon';
import { PageHeader } from '@/components/ui/PageHeader';
import { Skeleton } from '@/components/ui/Skeleton';
import { useAuth } from '@/hooks/useAuth';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { getUserMessage } from '@/utils/errors';
import { formatMonthYear, initials } from '@/utils/format';
import styles from './ProfilePage.module.css';

export default function ProfilePage() {
  useDocumentTitle('Profile');
  const { user, logout } = useAuth();
  const profile = useCurrentUser();
  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await logout();
    } finally {
      setLoggingOut(false);
    }
  };

  return (
    <div className="page-enter">
      <PageHeader eyebrow="Account" title="Profile" description="Your details and security overview." />

      <div className={styles.grid}>
        <Card padding="lg" className={styles.identity}>
          <span className={styles.avatar} aria-hidden="true">
            {user ? initials(user.name) : ''}
          </span>
          <div className={styles.identityText}>
            <h2 className={styles.name}>{user?.name}</h2>
            <p className={styles.email}>{user?.email}</p>
            {profile.data ? (
              <span className={styles.tier}>
                <Icon name="sparkle" size={14} /> {profile.data.tier} member
              </span>
            ) : profile.isPending ? (
              <Skeleton width="7rem" height="1.5rem" radius="var(--radius-full)" />
            ) : null}
          </div>
        </Card>

        <Card as="section" padding="lg" aria-labelledby="details-title">
          <h2 id="details-title" className={styles.sectionTitle}>
            Account details
          </h2>
          {profile.isPending ? (
            <dl className={styles.details} aria-busy="true">
              {[0, 1, 2, 3].map((index) => (
                <div key={index} className={styles.detail}>
                  <Skeleton width="35%" height="0.75rem" />
                  <Skeleton width="60%" height="1rem" />
                </div>
              ))}
            </dl>
          ) : profile.isError ? (
            <ErrorState
              compact
              title="Unable to load your details."
              message={getUserMessage(profile.error)}
              onRetry={() => void profile.refetch()}
              retrying={profile.isRefetching}
            />
          ) : (
            <dl className={styles.details}>
              <div className={styles.detail}>
                <dt>Phone number</dt>
                <dd>{profile.data.phone}</dd>
              </div>
              <div className={styles.detail}>
                <dt>Account number</dt>
                <dd className={styles.mono}>{profile.data.accountNumberMasked}</dd>
              </div>
              <div className={styles.detail}>
                <dt>BVN</dt>
                <dd className={styles.mono}>{profile.data.bvnMasked}</dd>
              </div>
              <div className={styles.detail}>
                <dt>Member since</dt>
                <dd>{formatMonthYear(profile.data.memberSince)}</dd>
              </div>
            </dl>
          )}
          <p className={styles.privacy}>
            <Icon name="shield" size={14} />
            Sensitive identifiers are masked by our servers and never stored in this browser.
          </p>
        </Card>

        <Card as="section" padding="lg" aria-labelledby="security-title">
          <h2 id="security-title" className={styles.sectionTitle}>
            Security
          </h2>
          <ul className={styles.securityList}>
            <li>
              <Icon name="check" size={16} /> Short-lived session tokens, refreshed automatically
            </li>
            <li>
              <Icon name="check" size={16} /> Encrypted connection (HTTPS in production)
            </li>
            <li>
              <Icon name="check" size={16} /> Every action re-verified by our servers
            </li>
          </ul>
          <Button
            variant="danger"
            onClick={handleLogout}
            loading={loggingOut}
            loadingText="Signing out…"
            leadingIcon={<Icon name="logout" size={18} />}
          >
            Logout
          </Button>
        </Card>
      </div>
    </div>
  );
}
