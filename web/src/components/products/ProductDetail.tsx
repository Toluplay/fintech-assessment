import type { ReactNode } from 'react';
import { Card } from '@/components/ui/Card';
import { Icon, type IconName } from '@/components/ui/Icon';
import { Skeleton, SkeletonText } from '@/components/ui/Skeleton';
import type { LoanIcon, SavingsIcon } from '@/types/products';
import { ProductIcon } from './ProductIcon';
import styles from './ProductDetail.module.css';

/* ---------- Layout ---------- */

interface DetailLayoutProps {
  main: ReactNode;
  aside: ReactNode;
}

export function DetailLayout({ main, aside }: DetailLayoutProps) {
  return (
    <div className={styles.layout}>
      <div className={styles.main}>{main}</div>
      <aside className={styles.aside}>{aside}</aside>
    </div>
  );
}

/* ---------- Hero ---------- */

interface DetailHeroProps {
  icon: SavingsIcon | LoanIcon;
  tone: 'savings' | 'loans';
  name: string;
  description: string;
  /** Full description is loaded with the detail record; show a skeleton meanwhile. */
  loading?: boolean;
}

export function DetailHero({ icon, tone, name, description, loading }: DetailHeroProps) {
  return (
    <Card padding="lg" className={styles.hero}>
      <div className={styles.heroTop}>
        <ProductIcon icon={icon} tone={tone} size="lg" />
        <div>
          <p className={styles.eyebrow}>{tone === 'savings' ? 'Savings product' : 'Loan product'}</p>
          <h1 className={styles.title}>{name}</h1>
        </div>
      </div>
      {loading ? <SkeletonText lines={3} /> : <p className={styles.lead}>{description}</p>}
    </Card>
  );
}

/* ---------- Key facts ---------- */

export interface Fact {
  label: string;
  value: ReactNode;
  icon?: IconName;
}

export function FactGrid({ facts, loading }: { facts: Fact[]; loading?: boolean }) {
  return (
    <dl className={styles.facts}>
      {facts.map((fact) => (
        <div key={fact.label} className={styles.fact}>
          <dt>
            {fact.icon ? <Icon name={fact.icon} size={16} /> : null}
            {fact.label}
          </dt>
          <dd>{loading && fact.value === undefined ? <Skeleton width="70%" height="1.1rem" /> : fact.value}</dd>
        </div>
      ))}
    </dl>
  );
}

/* ---------- Lists ---------- */

interface CheckListProps {
  title: string;
  items: string[] | undefined;
  icon?: IconName;
  tone?: 'positive' | 'neutral';
}

export function CheckList({ title, items, icon = 'check', tone = 'positive' }: CheckListProps) {
  return (
    <Card as="section" padding="lg" aria-labelledby={`list-${slug(title)}`}>
      <h2 id={`list-${slug(title)}`} className={styles.sectionTitle}>
        {title}
      </h2>
      {items ? (
        <ul className={styles.list}>
          {items.map((item) => (
            <li key={item} className={styles.listItem}>
              <span className={`${styles.bullet} ${styles[tone]}`}>
                <Icon name={icon} size={14} />
              </span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
      ) : (
        <SkeletonText lines={4} />
      )}
    </Card>
  );
}

/* ---------- Action card ---------- */

interface ActionCardProps {
  title: string;
  children: ReactNode;
  footnote?: string;
}

export function ActionCard({ title, children, footnote }: ActionCardProps) {
  return (
    <Card padding="lg" className={styles.action}>
      <h2 className={styles.sectionTitle}>{title}</h2>
      {children}
      {footnote ? (
        <p className={styles.footnote}>
          <Icon name="shield" size={14} />
          {footnote}
        </p>
      ) : null}
    </Card>
  );
}

export function DetailSkeleton() {
  return (
    <div role="status" aria-live="polite" data-testid="detail-skeleton">
      <p className="visually-hidden">Loading product details…</p>
      <DetailLayout
        main={
          <>
            <Card padding="lg" aria-hidden="true">
              <div className={styles.heroTop}>
                <Skeleton width="3.5rem" height="3.5rem" radius="var(--radius-lg)" />
                <div style={{ flex: 1 }}>
                  <Skeleton width="30%" height="0.75rem" />
                  <Skeleton width="55%" height="1.75rem" style={{ marginTop: '0.5rem' }} />
                </div>
              </div>
              <SkeletonText lines={3} />
            </Card>
            <Card padding="lg" aria-hidden="true">
              <SkeletonText lines={4} />
            </Card>
          </>
        }
        aside={
          <Card padding="lg" aria-hidden="true">
            <Skeleton width="50%" height="1.25rem" />
            <Skeleton height="2.75rem" radius="var(--radius-md)" style={{ marginTop: '1rem' }} />
          </Card>
        }
      />
    </div>
  );
}

function slug(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, '-');
}
