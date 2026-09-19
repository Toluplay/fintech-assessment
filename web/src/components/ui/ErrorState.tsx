import { Button } from './Button';
import { Icon } from './Icon';
import styles from './ErrorState.module.css';

interface ErrorStateProps {
  title: string;
  /** Already user-safe copy - see utils/errors. */
  message: string;
  onRetry?: () => void;
  retrying?: boolean;
  compact?: boolean;
}

/** Friendly failure panel with a retry action. Announced as an alert. */
export function ErrorState({ title, message, onRetry, retrying = false, compact }: ErrorStateProps) {
  return (
    <div className={`${styles.panel} ${compact ? styles.compact : ''}`} role="alert">
      <span className={styles.icon}>
        <Icon name="alert" size={22} />
      </span>
      <div className={styles.body}>
        <h3 className={styles.title}>{title}</h3>
        <p className={styles.message}>{message}</p>
      </div>
      {onRetry ? (
        <Button
          variant="secondary"
          size="sm"
          onClick={onRetry}
          loading={retrying}
          loadingText="Retrying…"
          leadingIcon={<Icon name="refresh" size={16} />}
        >
          Try again
        </Button>
      ) : null}
    </div>
  );
}
