import { type Icon } from '@phosphor-icons/react';
import { type ReactNode } from 'react';
import styles from './EmptyState.module.css';

interface EmptyStateProps {
  icon: Icon;
  title: string;
  body: string;
  /** Primary call-to-action (e.g. a Button). */
  action?: ReactNode;
}

/**
 * Zero-data (first-run) empty state — pale surface, large icon, title, one
 * sentence of value, and a primary CTA. Text on the pale fill is navy.
 */
export function EmptyState({ icon: IconComponent, title, body, action }: EmptyStateProps) {
  return (
    <div className={styles.empty}>
      <span className={styles.iconCircle} aria-hidden="true">
        <IconComponent size={32} weight="regular" />
      </span>
      <h2 className={styles.title}>{title}</h2>
      <p className={styles.body}>{body}</p>
      {action && <div className={styles.action}>{action}</div>}
    </div>
  );
}
