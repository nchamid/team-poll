import { type KeyboardEvent } from 'react';
import styles from './PickRow.module.css';

interface PickRowProps {
  label: string;
  selected: boolean;
  onPick: () => void;
}

/**
 * Custom radio "pick row" (D4) — a full-width clickable row with a custom radio
 * circle and accent border/tint on selection. Uses role="radio" with
 * aria-checked; activated by click, Enter, or Space.
 */
export function PickRow({ label, selected, onPick }: PickRowProps) {
  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>): void {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      onPick();
    }
  }

  return (
    <div
      role="radio"
      aria-checked={selected}
      tabIndex={0}
      className={`${styles.row} ${selected ? styles.selected : ''}`}
      onClick={onPick}
      onKeyDown={handleKeyDown}
    >
      <span className={styles.radio} aria-hidden="true">
        {selected && <span className={styles.dot} />}
      </span>
      <span className={styles.label}>{label}</span>
    </div>
  );
}
