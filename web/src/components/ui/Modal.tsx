import { useEffect, useRef, type ReactNode } from 'react';
import { Icon } from './Icon';
import styles from './Modal.module.css';

interface ModalProps {
  open: boolean;
  title: string;
  description?: string;
  onClose: () => void;
  children: ReactNode;
  footer?: ReactNode;
}


export function Modal({ open, title, description, onClose, children, footer }: ModalProps) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    
    <dialog
      ref={ref}
      className={styles.dialog}
      aria-labelledby="modal-title"
      aria-describedby={description ? 'modal-description' : undefined}
      onClose={onClose}
      onClick={(event) => {
        
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div className={styles.panel}>
        <header className={styles.header}>
          <div>
            <h2 id="modal-title" className={styles.title}>
              {title}
            </h2>
            {description ? (
              <p id="modal-description" className={styles.description}>
                {description}
              </p>
            ) : null}
          </div>
          <button type="button" className={styles.close} onClick={onClose} aria-label="Close dialog">
            <Icon name="close" size={18} />
          </button>
        </header>
        <div className={styles.body}>{children}</div>
        {footer ? <footer className={styles.footer}>{footer}</footer> : null}
      </div>
    </dialog>
  );
}
