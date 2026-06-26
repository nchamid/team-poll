import { type ReactNode } from 'react';
import styles from './Badge.module.css';

type Variant = 'live' | 'archived';

/**
 * Status badge — pill shape, pale fill, navy text (theme-stable). "live" maps
 * to an Open poll, "archived" to a Closed one. Colour is never the sole signal
 * — the label text always carries the meaning.
 */
export function Badge({ variant, children }: { variant: Variant; children: ReactNode }) {
  return (
    <span className={`${styles.badge} ${variant === 'live' ? styles.live : styles.archived}`}>
      {variant === 'live' && <span className={styles.dot} aria-hidden="true" />}
      {children}
    </span>
  );
}
