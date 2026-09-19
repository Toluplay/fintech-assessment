import { useUiStore } from '@/store/ui.store';
import { Icon, type IconName } from './Icon';
import styles from './Toaster.module.css';

const ICONS: Record<string, IconName> = { success: 'check', error: 'alert', info: 'info' };

/** Global notification region. Polite live region so it never interrupts. */
export function Toaster() {
  const toasts = useUiStore((state) => state.toasts);
  const dismiss = useUiStore((state) => state.dismissToast);

  return (
    <div className={styles.region} role="status" aria-live="polite" aria-atomic="false">
      {toasts.map((toast) => (
        <div key={toast.id} className={`${styles.toast} ${styles[toast.tone]}`}>
          <span className={styles.icon}>
            <Icon name={ICONS[toast.tone]} size={18} />
          </span>
          <div className={styles.text}>
            <p className={styles.title}>{toast.title}</p>
            {toast.description ? <p className={styles.description}>{toast.description}</p> : null}
          </div>
          <button
            type="button"
            className={styles.close}
            onClick={() => dismiss(toast.id)}
            aria-label="Dismiss notification"
          >
            <Icon name="close" size={16} />
          </button>
        </div>
      ))}
    </div>
  );
}
