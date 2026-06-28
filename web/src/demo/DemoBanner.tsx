import { Info } from '@phosphor-icons/react';
import styles from './DemoBanner.module.css';

/**
 * Honest marker for the static demo build: tells viewers the data is sample
 * data and no sign-in is involved. Demo-only — never rendered in the real app.
 */
export function DemoBanner() {
  return (
    <div className={styles.banner} role="note" aria-label="Demo build with sample data">
      <Info size={16} weight="regular" aria-hidden="true" />
      <span className={styles.label}>Demo</span>
      <span className={styles.detail}>Sample data · no sign-in</span>
    </div>
  );
}
