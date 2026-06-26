import { useMemo } from 'react';
import styles from './Avatar.module.css';

interface AvatarProps {
  /** Display name — drives the initials. Never logged. */
  name: string;
  size?: number;
}

function initialsOf(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) {
    return '?';
  }
  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

/** Decorative initials avatar. The adjacent name carries the meaning. */
export function Avatar({ name, size = 24 }: AvatarProps) {
  const initials = useMemo(() => initialsOf(name), [name]);
  const fontSize = Math.max(10, Math.round(size * 0.42));
  return (
    <span
      className={styles.avatar}
      style={{ width: size, height: size, fontSize }}
      aria-hidden="true"
    >
      {initials}
    </span>
  );
}
