import { useMemo } from 'react';
import { Users, PencilSimple } from '@phosphor-icons/react';
import { Button } from '@/components/Button';
import { type PollDetail } from '../../types';
import { totalVotesLabel } from '../../utils';
import { ResultBar } from '../ResultBar';
import { useBarAnimation } from '../../hooks/useBarAnimation';
import styles from './PollDetailPage.module.css';

interface ResultsPanelProps {
  poll: PollDetail;
  /** Show the "Change vote" affordance (open poll, member who has voted). */
  canChange: boolean;
  onChange: () => void;
}

/** The results state — animated bars (D2), "Your vote" + leading emphasis (D3). */
export function ResultsPanel({ poll, canChange, onChange }: ResultsPanelProps) {
  const maxVotes = useMemo(
    () => poll.options.reduce((max, option) => Math.max(max, option.voteCount ?? 0), 0),
    [poll.options],
  );
  const animated = useBarAnimation(true, poll.myVote);
  const changeLabel = poll.myVote != null ? 'Change vote' : 'Cast your vote';

  return (
    <div className={styles.results}>
      <div className={styles.resultList}>
        {poll.options.map((option) => {
          const count = option.voteCount ?? 0;
          return (
            <ResultBar
              key={option.id}
              label={option.text}
              count={count}
              percentage={option.percentage ?? 0}
              isMine={poll.myVote === option.id}
              isLeading={poll.totalVotes > 0 && count === maxVotes}
              animated={animated}
            />
          );
        })}
      </div>
      <div className={styles.total}>
        <Users size={18} weight="regular" aria-hidden="true" />
        <span>{totalVotesLabel(poll.totalVotes)}</span>
      </div>
      {canChange && (
        <div>
          <Button variant="secondary" icon={PencilSimple} onClick={onChange}>
            {changeLabel}
          </Button>
        </div>
      )}
    </div>
  );
}
