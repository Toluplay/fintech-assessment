import type { IconName } from '@/components/ui/Icon';

export interface NavItem {
  to: string;
  label: string;
  icon: IconName;
}

export const NAV_ITEMS: NavItem[] = [
  { to: '/dashboard', label: 'Dashboard', icon: 'home' },
  { to: '/savings', label: 'Savings', icon: 'savings' },
  { to: '/loans', label: 'Loans', icon: 'loans' },
  { to: '/profile', label: 'Profile', icon: 'user' },
];
