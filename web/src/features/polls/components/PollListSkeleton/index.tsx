import { Skeleton } from '@/components/Skeleton';
import styles from './PollListSkeleton.module.css';

const PLACEHOLDER_CARDS = [0, 1, 2];

/** Loading skeleton that matches the card-grid layout (one section, 3 cards). */
export function PollListSkeleton() {
  return (
    <div className={styles.wrap} aria-hidden="true">
      <Skeleton width="80px" height="14px" />
      <div className={styles.grid}>
        {PLACEHOLDER_CARDS.map((index) => (
          <div key={index} className={styles.card}>
            <Skeleton width="56px" height="24px" radius="999px" />
            <Skeleton width="90%" height="24px" />
            <Skeleton width="60%" height="24px" />
            <div className={styles.cardFooter}>
              <Skeleton width="120px" height="16px" />
              <Skeleton width="80px" height="16px" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
