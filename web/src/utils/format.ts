const ngn = new Intl.NumberFormat('en-NG', {
  style: 'currency',
  currency: 'NGN',
  maximumFractionDigits: 0,
});

const ngnCompact = new Intl.NumberFormat('en-NG', {
  style: 'currency',
  currency: 'NGN',
  notation: 'compact',
  maximumFractionDigits: 1,
});

/** 5000 -> "₦5,000" */
export function formatCurrency(amount: number, options: { compact?: boolean } = {}): string {
  return (options.compact ? ngnCompact : ngn).format(amount);
}

/** (50000, 2000000) -> "₦50,000 – ₦2,000,000" */
export function formatCurrencyRange(min: number, max: number, compact = false): string {
  return `${formatCurrency(min, { compact })} – ${formatCurrency(max, { compact })}`;
}

/** 12 -> "12%" */
export function formatPercent(rate: number): string {
  return `${rate}%`;
}

/** "2022-03-14" -> "March 2022" */
export function formatMonthYear(isoDate: string): string {
  return new Intl.DateTimeFormat('en-NG', { month: 'long', year: 'numeric' }).format(
    new Date(isoDate),
  );
}

/** "John Doe" -> "JD" */
export function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('');
}

export function greetingForHour(hour = new Date().getHours()): string {
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}
