import { McDermottSymbol } from './McDermottSymbol';
import styles from './Lockup.module.css';

interface LockupProps {
  /** The application name, set in Georgia. */
  name: string;
  /** Surface the lockup sits on — drives the foreground colour. */
  surface?: 'sidebar' | 'light';
}

/**
 * The McDermott application lockup: symbol + thin divider + app name.
 * The divider is the master-brand cue and is never omitted. `currentColor`
 * flows to all three parts; `surface` sets that colour.
 */
export function Lockup({ name, surface = 'sidebar' }: LockupProps) {
  return (
    <span className={`lockup ${surface === 'sidebar' ? styles.sidebar : styles.light}`}>
      <span className="lockup__symbol">
        <McDermottSymbol size={32} />
      </span>
      <span className="lockup__divider" aria-hidden="true" />
      <span className="lockup__name">{name}</span>
    </span>
  );
}
