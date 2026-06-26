import { Check } from '@phosphor-icons/react';
import { Button } from '@/components/Button';
import { type PollDetail } from '../../types';
import { PickRow } from '../PickRow';
import styles from './PollDetailPage.module.css';

interface VotingPanelProps {
  poll: PollDetail;
  draftVote: number | null;
  submitting: boolean;
  /** Whether a Cancel action is offered (only when a prior vote exists). */
  showCancel: boolean;
  onPick: (optionId: number) => void;
  onSubmit: () => void;
  onCancel: () => void;
}

/** The voting state — custom radio pick-rows plus the cast/update action. */
export function VotingPanel({
  poll,
  draftVote,
  submitting,
  showCancel,
  onPick,
  onSubmit,
  onCancel,
}: VotingPanelProps) {
  const ctaLabel = poll.myVote != null ? 'Update vote' : 'Cast vote';
  return (
    <div className={styles.voting}>
      <p className={styles.votingHint}>
        Choose one option, then cast your vote. You can change it while the poll is open.
      </p>
      <div role="radiogroup" aria-label="Poll options" className={styles.pickList}>
        {poll.options.map((option) => (
          <PickRow
            key={option.id}
            label={option.text}
            selected={draftVote === option.id}
            onPick={() => onPick(option.id)}
          />
        ))}
      </div>
      <div className={styles.votingActions}>
        <Button icon={Check} onClick={onSubmit} disabled={draftVote == null} loading={submitting}>
          {ctaLabel}
        </Button>
        {showCancel && (
          <Button variant="secondary" onClick={onCancel}>
            Cancel
          </Button>
        )}
      </div>
    </div>
  );
}
