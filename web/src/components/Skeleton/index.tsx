import styles from './Skeleton.module.css';

interface SkeletonProps {
  width?: string;
  height?: string;
  radius?: string;
  className?: string;
}

/**
 * A single skeleton block. Pulses base → pulse colour; degrades to a static
 * low-opacity placeholder under reduced motion. Compose these to match the
 * real layout while data loads.
 */
export function Skeleton({ width = '100%', height = '16px', radius, className }: SkeletonProps) {
  return (
    <span
      className={`${styles.skeleton} ${className ?? ''}`}
      style={{ width, height, borderRadius: radius }}
      aria-hidden="true"
    />
  );
}
