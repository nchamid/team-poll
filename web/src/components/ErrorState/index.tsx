import { type ReactNode } from 'react';
import { Prohibit, MagnifyingGlass, WarningCircle } from '@phosphor-icons/react';
import { ApiError } from '@/lib/apiClient';
import styles from './ErrorState.module.css';

interface ErrorStateProps {
  error: unknown;
  /** Optional recovery action (e.g. a retry / back Button). */
  action?: ReactNode;
}

interface Copy {
  icon: typeof Prohibit;
  title: string;
  body: string;
}

/**
 * Maps an error to MWS error copy (what + why + how). 403 → no access, 404 →
 * not found / soft-deleted, otherwise a generic transient failure. The raw
 * ProblemDetails `detail` is never surfaced verbatim — copy is plain-language.
 */
function copyFor(error: unknown): Copy {
  if (error instanceof ApiError) {
    if (error.status === 403) {
      return {
        icon: Prohibit,
        title: "You don't have access to this poll",
        body: 'Only the poll owner or an admin can do that. Head back to the list to keep going.',
      };
    }
    if (error.status === 404) {
      return {
        icon: MagnifyingGlass,
        title: 'This poll is no longer available',
        body: 'It may have been deleted by its owner. Return to the list to see current polls.',
      };
    }
  }
  return {
    icon: WarningCircle,
    title: 'Something went wrong',
    body: "We couldn't load this just now. Try again in a moment.",
  };
}

export function ErrorState({ error, action }: ErrorStateProps) {
  const { icon: IconComponent, title, body } = copyFor(error);
  return (
    <div className={styles.error} role="alert">
      <span className={styles.iconCircle} aria-hidden="true">
        <IconComponent size={32} weight="regular" />
      </span>
      <h2 className={styles.title}>{title}</h2>
      <p className={styles.body}>{body}</p>
      {action && <div className={styles.action}>{action}</div>}
    </div>
  );
}
