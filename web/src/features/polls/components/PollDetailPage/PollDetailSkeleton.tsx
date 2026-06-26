import { Skeleton } from '@/components/Skeleton';
import styles from './PollDetailPage.module.css';

const PLACEHOLDER_ROWS = [0, 1, 2];

/** Loading skeleton matching the detail card layout. */
export function PollDetailSkeleton() {
  return (
    <div className={styles.page} aria-hidden="true">
      <Skeleton width="120px" height="14px" />
      <div className={styles.card}>
        <Skeleton width="56px" height="24px" radius="999px" />
        <Skeleton width="80%" height="30px" />
        <Skeleton width="40%" height="16px" />
        <div className={styles.divider} />
        <div className={styles.skeletonRows}>
          {PLACEHOLDER_ROWS.map((index) => (
            <Skeleton key={index} width="100%" height="56px" />
          ))}
        </div>
      </div>
    </div>
  );
}
