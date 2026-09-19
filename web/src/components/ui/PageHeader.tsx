import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { Icon } from './Icon';
import styles from './PageHeader.module.css';

interface PageHeaderProps {
  /** Omit on pages whose main content renders its own <h1> (e.g. product detail). */
  title?: ReactNode;
  description?: ReactNode;
  eyebrow?: string;
  backTo?: { to: string; label: string };
  actions?: ReactNode;
}

export function PageHeader({ title, description, eyebrow, backTo, actions }: PageHeaderProps) {
  return (
    <header className={styles.header}>
      <div className={styles.text}>
        {backTo ? (
          <Link to={backTo.to} className={styles.back}>
            <Icon name="arrowLeft" size={16} />
            {backTo.label}
          </Link>
        ) : null}
        {eyebrow ? <p className={styles.eyebrow}>{eyebrow}</p> : null}
        {title ? <h1 className={styles.title}>{title}</h1> : null}
        {description ? <p className={styles.description}>{description}</p> : null}
      </div>
      {actions ? <div className={styles.actions}>{actions}</div> : null}
    </header>
  );
}
