export interface SavingsProductSummary {
  id: string;
  name: string;
  /** Annual interest rate as a percentage, e.g. 12 -> "12% p.a." */
  interestRate: number;
  minimumAmount: number;
  duration: string;
  description: string;
  /** Icon key rendered by the client, keeps the API free of presentation assets. */
  icon: 'target' | 'flex' | 'lock';
  currency: 'NGN';
}

export interface SavingsProduct extends SavingsProductSummary {
  maximumAmount: number | null;
  longDescription: string;
  features: string[];
  terms: string[];
}

export const SAVINGS_PRODUCTS: SavingsProduct[] = [
  {
    id: '1',
    name: 'Target Savings',
    interestRate: 12,
    minimumAmount: 5000,
    maximumAmount: 50_000_000,
    duration: '12 months',
    description: 'Save towards a specific financial goal.',
    longDescription:
      'Set a goal - a car, tuition, a wedding, an emergency fund - and automate contributions towards it. Your money is locked until the target date so you stay disciplined, and it earns a competitive fixed rate the whole time.',
    icon: 'target',
    currency: 'NGN',
    features: [
      'Automated daily, weekly or monthly contributions',
      '12% p.a. interest paid at maturity',
      'Goal progress tracking and milestone reminders',
      'Top up any time from your Veridian wallet',
      'Free withdrawal on the target date',
    ],
    terms: [
      'Minimum contribution of NGN 5,000 to open a plan.',
      'Plan duration is fixed at 12 months from the first deposit.',
      'Early withdrawal forfeits accrued interest and attracts a 2.5% fee.',
      'Interest is calculated daily and paid on maturity.',
      'Returns are subject to applicable withholding tax.',
    ],
  },
  {
    id: '2',
    name: 'Flexible Savings',
    interestRate: 8,
    minimumAmount: 1000,
    maximumAmount: null,
    duration: 'Flexible',
    description: 'Save and withdraw whenever you like, with interest paid daily.',
    longDescription:
      'A high-yield everyday savings account with no lock-in. Move money in and out as often as you need while your balance keeps earning daily interest - perfect for building an emergency fund.',
    icon: 'flex',
    currency: 'NGN',
    features: [
      'Withdraw at any time with no penalty',
      '8% p.a. interest, credited daily',
      'No maximum balance',
      'Instant transfers to any Nigerian bank account',
      'Round-up savings from your card spending',
    ],
    terms: [
      'Minimum opening deposit of NGN 1,000.',
      'Up to four free withdrawals per month; further withdrawals cost NGN 50 each.',
      'Interest rate is variable and reviewed quarterly.',
      'Returns are subject to applicable withholding tax.',
    ],
  },
  {
    id: '3',
    name: 'Fixed Savings',
    interestRate: 18,
    minimumAmount: 100_000,
    maximumAmount: 100_000_000,
    duration: '6 months',
    description: 'Lock a lump sum for six months and earn our highest guaranteed rate.',
    longDescription:
      'Ideal for money you will not need for a while. Lock in a lump sum for six months and enjoy a guaranteed 18% p.a. - our highest rate - with interest paid upfront or at maturity, your choice.',
    icon: 'lock',
    currency: 'NGN',
    features: [
      'Guaranteed 18% p.a. fixed for the full term',
      'Choose upfront or maturity interest payout',
      'Automatic rollover option at maturity',
      'Deposits insured under the NDIC scheme',
      'Dedicated relationship manager for balances above NGN 10M',
    ],
    terms: [
      'Minimum deposit of NGN 100,000; maximum of NGN 100,000,000 per plan.',
      'Funds are locked for 6 months from the deposit date.',
      'Early liquidation forfeits all accrued interest.',
      'Upfront interest is paid within 24 hours of funding.',
      'Returns are subject to applicable withholding tax.',
    ],
  },
];

export function toSavingsSummary(product: SavingsProduct): SavingsProductSummary {
  const { id, name, interestRate, minimumAmount, duration, description, icon, currency } = product;
  return { id, name, interestRate, minimumAmount, duration, description, icon, currency };
}
