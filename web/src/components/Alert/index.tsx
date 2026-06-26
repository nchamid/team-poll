import { type ReactNode } from 'react';
import { Info, Warning, XCircle, CheckCircle } from '@phosphor-icons/react';
import styles from './Alert.module.css';

type Severity = 'info' | 'success' | 'warning' | 'error';

const iconFor = {
  info: Info,
  success: CheckCircle,
  warning: Warning,
  error: XCircle,
};

const classFor: Record<Severity, string> = {
  info: styles.info,
  success: styles.success,
  warning: styles.warning,
  error: styles.error,
};

/**
 * Inline alert — 4px left border in the severity colour, pale fill, navy text
 * (theme-stable). Used for contextual warnings and error surfaces. `role` is
 * "alert" for error/warning (assertive) and "status" otherwise.
 */
export function Alert({ severity, children }: { severity: Severity; children: ReactNode }) {
  const IconComponent = iconFor[severity];
  const assertive = severity === 'error' || severity === 'warning';
  return (
    <div className={`${styles.alert} ${classFor[severity]}`} role={assertive ? 'alert' : 'status'}>
      <IconComponent size={20} weight="regular" aria-hidden="true" className={styles.icon} />
      <div className={styles.body}>{children}</div>
    </div>
  );
}
