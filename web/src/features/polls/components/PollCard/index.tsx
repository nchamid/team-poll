import { memo, type KeyboardEvent } from 'react';
import { Badge } from '@/components/Badge';
import { Avatar } from '@/components/Avatar';
import { type PollSummary } from '../../types';
import { pollMeta } from '../../utils';
import styles from './PollCard.module.css';

interface PollCardProps {
  poll: PollSummary;
  onOpen: (pollId: number) => void;
}

/**
 * A single poll card: status badge, large serif question, owner avatar + name,
 * and "N options · N votes" meta. The whole card opens the poll. Keyboard users
 * activate it with Enter or Space.
 */
function PollCardComponent({ poll, onOpen }: PollCardProps) {
  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>): void {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      onOpen(poll.id);
    }
  }

  return (
    <div
      role="button"
      tabIndex={0}
      className={styles.card}
      onClick={() => onOpen(poll.id)}
      onKeyDown={handleKeyDown}
      aria-label={`Open poll: ${poll.question}`}
    >
      <div className={styles.badgeRow}>
        <Badge variant={poll.isClosed ? 'archived' : 'live'}>
          {poll.isClosed ? 'Closed' : 'Open'}
        </Badge>
      </div>
      <div className={styles.question}>{poll.question}</div>
      <div className={styles.footer}>
        <div className={styles.owner}>
          <Avatar name={poll.ownerDisplayName} size={24} />
          <span className={styles.ownerName}>{poll.ownerDisplayName}</span>
        </div>
        <span className={styles.meta}>{pollMeta(poll.optionCount, poll.totalVotes)}</span>
      </div>
    </div>
  );
}

export const PollCard = memo(PollCardComponent);
