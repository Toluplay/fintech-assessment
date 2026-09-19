import styles from './Logo.module.css';

interface LogoProps {
  /** `dark` for light backgrounds, `light` for the brand-green panels. */
  tone?: 'dark' | 'light';
  size?: 'sm' | 'md' | 'lg';
  wordmark?: boolean;
}

export function Logo({ tone = 'dark', size = 'md', wordmark = true }: LogoProps) {
  const px = size === 'lg' ? 40 : size === 'sm' ? 28 : 32;
  return (
    <span className={`${styles.logo} ${styles[tone]} ${styles[size]}`}>
      <svg width={px} height={px} viewBox="0 0 32 32" aria-hidden="true" focusable="false">
        <rect width="32" height="32" rx="8" className={styles.tile} />
        <path d="M8 9l8 14 8-14h-4.2L16 16.2 12.2 9z" className={styles.mark} />
      </svg>
      {wordmark ? (
        <span className={styles.wordmark}>
          Veridian<span className="visually-hidden"> - Savings and Loans</span>
        </span>
      ) : null}
    </span>
  );
}
