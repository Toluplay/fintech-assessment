export interface LoanProductSummary {
  id: string;
  name: string;
  minAmount: number;
  maxAmount: number;
  /** Monthly interest rate as a percentage, or null when priced per application. */
  interestRate: number | null;
  interestLabel: string;
  tenure: string;
  description: string;
  icon: 'person' | 'salary' | 'business';
  currency: 'NGN';
}

export interface LoanProduct extends LoanProductSummary {
  longDescription: string;
  eligibility: string[];
  requirements: string[];
  /** Typical time from approval to disbursement, shown on the detail page. */
  disbursement: string;
}

export const LOAN_PRODUCTS: LoanProduct[] = [
  {
    id: '1',
    name: 'Personal Loan',
    minAmount: 50_000,
    maxAmount: 2_000_000,
    interestRate: 5,
    interestLabel: '5% monthly',
    tenure: '3-12 months',
    description: 'Quick cash for life’s big and small moments, repaid in easy instalments.',
    longDescription:
      'Whether it is rent, school fees or an unexpected bill, a Personal Loan gives you up to NGN 2,000,000 with a repayment plan that fits your income. Decisions are automated and most customers are funded the same day.',
    icon: 'person',
    currency: 'NGN',
    disbursement: 'Within 24 hours of approval',
    eligibility: [
      'Nigerian resident aged 21-60',
      'Verified BVN and government-issued ID',
      'Minimum monthly income of NGN 100,000',
      'Veridian account active for at least 3 months',
      'No active loan default on any credit bureau',
    ],
    requirements: [
      'Six months of bank statements',
      'Proof of address (utility bill not older than 3 months)',
      'Employer details or proof of income',
      'Recent passport photograph',
    ],
  },
  {
    id: '2',
    name: 'Salary Advance',
    minAmount: 50_000,
    maxAmount: 500_000,
    interestRate: 4,
    interestLabel: '4% monthly',
    tenure: '1-3 months',
    description: 'Access up to 50% of your next salary before payday.',
    longDescription:
      'Bridge the gap to payday. Salary Advance lets salaried customers borrow up to half of their verified monthly salary and repay automatically when their salary arrives.',
    icon: 'salary',
    currency: 'NGN',
    disbursement: 'Instant for pre-approved customers',
    eligibility: [
      'Salary paid into a Veridian account for at least 2 consecutive months',
      'Aged 21-58',
      'Verified BVN',
      'No outstanding Salary Advance',
    ],
    requirements: [
      'Employment confirmation letter or payslip',
      'Valid government-issued ID',
      'Salary account must remain domiciled with Veridian for the loan tenure',
    ],
  },
  {
    id: '3',
    name: 'Business Loan',
    minAmount: 500_000,
    maxAmount: 10_000_000,
    interestRate: null,
    interestLabel: 'Based on assessment',
    tenure: '6-24 months',
    description: 'Working capital and growth financing for registered SMEs.',
    longDescription:
      'Fund inventory, equipment or expansion with up to NGN 10,000,000. Pricing is tailored to your business after a short assessment of your cash flow, with flexible tenures of up to two years.',
    icon: 'business',
    currency: 'NGN',
    disbursement: '3-5 working days after assessment',
    eligibility: [
      'Business registered with the CAC for at least 12 months',
      'Minimum annual turnover of NGN 5,000,000',
      'Business account with Veridian or 12 months of statements from another bank',
      'Directors must have verified BVN and no active defaults',
    ],
    requirements: [
      'CAC registration documents',
      '12 months of business bank statements',
      'Tax identification number (TIN)',
      'Two years of audited or management accounts',
      'Collateral or personal guarantee for amounts above NGN 5,000,000',
    ],
  },
];

export function toLoanSummary(product: LoanProduct): LoanProductSummary {
  const {
    id,
    name,
    minAmount,
    maxAmount,
    interestRate,
    interestLabel,
    tenure,
    description,
    icon,
    currency,
  } = product;
  return {
    id,
    name,
    minAmount,
    maxAmount,
    interestRate,
    interestLabel,
    tenure,
    description,
    icon,
    currency,
  };
}
