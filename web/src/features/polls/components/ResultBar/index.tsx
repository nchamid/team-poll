import { CheckCircle } from '@phosphor-icons/react';
import styles from './ResultBar.module.css';

interface ResultBarProps {
  label: string;
  count: number;
  percentage: number;
  /** This is the option the current user voted for (D3 "Your vote" marker). */
  isMine: boolean;
  /** This option is (tied for) the front-runner (D3 leading-option emphasis). */
  isLeading: boolean;
  /** Animate the bar width from 0 → percentage. */
  animated: boolean;
}

/**
 * One result row (D2/D3): label, optional "Your vote" marker, percentage +
 * count, and a horizontal bar that eases its width 0 → % when `animated` flips.
 * The leading option's label and percentage render bold.
 */
export function ResultBar({
  label,
  count,
  percentage,
  isMine,
  isLeading,
  animated,
}: ResultBarProps) {
  return (
    <div className={styles.row}>
      <div className={styles.head}>
        <div className={styles.labelWrap}>
          <span className={`${styles.label} ${isLeading ? styles.leadingLabel : ''}`}>{label}</span>
          {isMine && (
            <span className={styles.mine}>
              <CheckCircle size={14} weight="regular" aria-hidden="true" />
              Your vote
            </span>
          )}
        </div>
        <div className={styles.stats}>
          <span className={`${styles.pct} ${isLeading ? styles.leadingPct : ''}`}>
            {percentage}%
          </span>{' '}
          · {count} {count === 1 ? 'vote' : 'votes'}
        </div>
      </div>
      <div className={styles.track}>
        <div className={styles.fill} style={{ width: animated ? `${percentage}%` : '0%' }} />
      </div>
    </div>
  );
}
