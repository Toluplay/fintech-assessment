import type { ReactNode } from 'react';
import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import { Modal } from '@/components/ui/Modal';
import styles from './ConfirmActionModal.module.css';

interface Summary {
  label: string;
  value: ReactNode;
}

interface ConfirmActionModalProps {
  open: boolean;
  title: string;
  description: string;
  summary: Summary[];
  confirmLabel: string;
  pendingLabel: string;
  pending: boolean;
  /** User-safe error message from the last failed attempt, if any. */
  error: string | null;
  onConfirm: () => void;
  onClose: () => void;
}

/**
 * Confirmation step for authenticated product actions (Start Saving / Apply).
 * Modal visibility is client state owned by the page; the request itself is a
 * TanStack mutation so loading and error states come from one source.
 */
export function ConfirmActionModal({
  open,
  title,
  description,
  summary,
  confirmLabel,
  pendingLabel,
  pending,
  error,
  onConfirm,
  onClose,
}: ConfirmActionModalProps) {
  return (
    <Modal
      open={open}
      title={title}
      description={description}
      onClose={() => {
        if (!pending) onClose();
      }}
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={pending}>
            Cancel
          </Button>
          <Button onClick={onConfirm} loading={pending} loadingText={pendingLabel}>
            {confirmLabel}
          </Button>
        </>
      }
    >
      <dl className={styles.summary}>
        {summary.map((item) => (
          <div key={item.label} className={styles.row}>
            <dt>{item.label}</dt>
            <dd>{item.value}</dd>
          </div>
        ))}
      </dl>
      {error ? (
        <p className={styles.error} role="alert">
          <Icon name="alert" size={16} />
          {error}
        </p>
      ) : null}
      <p className={styles.note}>
        <Icon name="shield" size={14} />
        This action is verified against your signed-in session on our servers.
      </p>
    </Modal>
  );
}
