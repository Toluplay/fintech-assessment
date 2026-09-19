import { Link } from 'react-router-dom';
import { ButtonLink } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Icon, type IconName } from '@/components/ui/Icon';
import { Skeleton } from '@/components/ui/Skeleton';
import { useAuth } from '@/hooks/useAuth';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { useLoanProducts } from '@/hooks/useLoanProducts';
import { useSavingsProducts } from '@/hooks/useSavingsProducts';
import { formatCurrency, formatPercent, greetingForHour } from '@/utils/format';
import styles from './DashboardPage.module.css';

const QUICK_LINKS: { to: string; icon: IconName; title: string; text: string; tone: string }[] = [
  {
    to: '/savings',
    icon: 'savings',
    title: 'Savings',
    text: 'Target, flexible and fixed plans earning up to 18% p.a.',
    tone: 'savings',
  },
  {
    to: '/loans',
    icon: 'loans',
    title: 'Loans',
    text: 'Personal, salary advance and business loans with fast decisions.',
    tone: 'loans',
  },
  {
    to: '/profile',
    icon: 'user',
    title: 'Profile',
    text: 'Your account details, tier and security settings.',
    tone: 'profile',
  },
];

/**
 * The dashboard reuses the same product queries as the Savings and Loans
 * pages, so the data is fetched once and shared through the query cache -
 * navigating between sections does not refetch.
 */
export default function DashboardPage() {
  useDocumentTitle('Dashboard');
  const { user } = useAuth();
  const savings = useSavingsProducts();
  const loans = useLoanProducts();

  const bestSavings = savings.data
    ? [...savings.data].sort((a, b) => b.interestRate - a.interestRate)[0]
    : undefined;
  const fastestLoan = loans.data?.find((loan) => loan.id === '2') ?? loans.data?.[0];
  const firstName = user?.name.split(' ')[0] ?? 'there';

  return (
    <div className={`${styles.page} page-enter`}>
      <section className={styles.hero} aria-labelledby="dashboard-title">
        <div>
          <p className={styles.greeting}>{greetingForHour()},</p>
          <h1 id="dashboard-title" className={styles.title}>
            {firstName}
          </h1>
          <p className={styles.subtitle}>
            Explore savings plans and loan products tailored to you.
          </p>
        </div>
        <div className={styles.heroBadge}>
          <Icon name="shield" size={18} />
          <span>Session secured</span>
        </div>
      </section>

      <section aria-labelledby="quick-links-title">
        <h2 id="quick-links-title" className={styles.sectionTitle}>
          Where would you like to go?
        </h2>
        <ul className={styles.quickLinks}>
          {QUICK_LINKS.map((item) => (
            <li key={item.to}>
              <Link to={item.to} className={`${styles.quickLink} ${styles[item.tone]}`}>
                <span className={styles.quickIcon}>
                  <Icon name={item.icon} size={22} />
                </span>
                <span className={styles.quickText}>
                  <span className={styles.quickTitle}>{item.title}</span>
                  <span className={styles.quickDesc}>{item.text}</span>
                </span>
                <Icon name="chevronRight" size={18} className={styles.chevron} />
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="highlights-title">
        <h2 id="highlights-title" className={styles.sectionTitle}>
          Highlights
        </h2>
        <div className={styles.highlights}>
          <Card className={styles.highlight} padding="lg">
            <p className={styles.highlightLabel}>
              <Icon name="trend" size={16} /> Best savings rate
            </p>
            {savings.isPending ? (
              <HighlightSkeleton />
            ) : savings.isError || !bestSavings ? (
              <p className={styles.highlightFallback}>
                Rates are temporarily unavailable. <Link to="/savings">Open savings</Link>
              </p>
            ) : (
              <>
                <p className={styles.highlightValue}>{formatPercent(bestSavings.interestRate)} p.a.</p>
                <p className={styles.highlightText}>
                  {bestSavings.name} · from {formatCurrency(bestSavings.minimumAmount)} ·{' '}
                  {bestSavings.duration}
                </p>
                <ButtonLink to={`/savings/${bestSavings.id}`} variant="secondary" size="sm">
                  View {bestSavings.name}
                </ButtonLink>
              </>
            )}
          </Card>

          <Card className={styles.highlight} padding="lg">
            <p className={styles.highlightLabel}>
              <Icon name="clock" size={16} /> Fastest loan
            </p>
            {loans.isPending ? (
              <HighlightSkeleton />
            ) : loans.isError || !fastestLoan ? (
              <p className={styles.highlightFallback}>
                Loan offers are temporarily unavailable. <Link to="/loans">Open loans</Link>
              </p>
            ) : (
              <>
                <p className={styles.highlightValue}>{fastestLoan.name}</p>
                <p className={styles.highlightText}>
                  Up to {formatCurrency(fastestLoan.maxAmount)} · {fastestLoan.tenure} ·{' '}
                  {fastestLoan.interestLabel}
                </p>
                <ButtonLink to={`/loans/${fastestLoan.id}`} variant="secondary" size="sm">
                  View {fastestLoan.name}
                </ButtonLink>
              </>
            )}
          </Card>
        </div>
      </section>
    </div>
  );
}

function HighlightSkeleton() {
  return (
    <div className={styles.highlightSkeleton} role="status" aria-label="Loading highlight">
      <Skeleton width="45%" height="1.75rem" />
      <Skeleton width="80%" height="0.875rem" />
      <Skeleton width="8rem" height="2.25rem" radius="var(--radius-md)" />
    </div>
  );
}
