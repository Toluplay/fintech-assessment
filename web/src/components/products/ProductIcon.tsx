import { Icon, type IconName } from '@/components/ui/Icon';
import type { LoanIcon, SavingsIcon } from '@/types/products';
import styles from './ProductIcon.module.css';

const ICON_MAP: Record<SavingsIcon | LoanIcon, IconName> = {
  target: 'target',
  flex: 'flex',
  lock: 'lock',
  person: 'person',
  salary: 'salary',
  business: 'business',
};

interface ProductIconProps {
  icon: SavingsIcon | LoanIcon;
  tone?: 'savings' | 'loans';
  size?: 'md' | 'lg';
}

export function ProductIcon({ icon, tone = 'savings', size = 'md' }: ProductIconProps) {
  return (
    <span className={`${styles.badge} ${styles[tone]} ${styles[size]}`}>
      <Icon name={ICON_MAP[icon]} size={size === 'lg' ? 28 : 22} />
    </span>
  );
}
