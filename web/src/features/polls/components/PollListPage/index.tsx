import { useMemo } from 'react';
import { Plus, ChartBarHorizontal, ArrowClockwise } from '@phosphor-icons/react';
import { Button } from '@/components/Button';
import { EmptyState } from '@/components/EmptyState';
import { ErrorState } from '@/components/ErrorState';
import { useNavigation } from '@/store/navigation';
import { usePolls } from '../../hooks/usePolls';
import { PollCard } from '../PollCard';
import { PollListSkeleton } from '../PollListSkeleton';
import { type PollSummary } from '../../types';
import styles from './PollListPage.module.css';

interface SectionProps {
  title: string;
  polls: PollSummary[];
  onOpen: (pollId: number) => void;
}

function PollSection({ title, polls, onOpen }: SectionProps) {
  if (polls.length === 0) {
    return null;
  }
  return (
    <section>
      <div className={styles.sectionHeader}>
        <span className={styles.sectionTitle}>{title}</span>
        <span className={styles.sectionCount}>{polls.length}</span>
      </div>
      <div className={styles.grid}>
        {polls.map((poll) => (
          <PollCard key={poll.id} poll={poll} onOpen={onOpen} />
        ))}
      </div>
    </section>
  );
}

/** S2 — Poll list (home). Card grid grouped Open then Closed, with states. */
export function PollListPage() {
  const { goCreate, goDetail } = useNavigation();
  const { data, isPending, isError, error, refetch } = usePolls();

  const { openPolls, closedPolls } = useMemo(() => {
    const items = data?.items ?? [];
    return {
      openPolls: items.filter((poll) => !poll.isClosed),
      closedPolls: items.filter((poll) => poll.isClosed),
    };
  }, [data]);

  const isEmpty = !isPending && !isError && (data?.items.length ?? 0) === 0;

  return (
    <div>
      <div className={styles.header}>
        <div className={styles.heading}>
          <p className="eyebrow">Team Poll</p>
          <h1 className="h2">Polls</h1>
        </div>
        <Button icon={Plus} onClick={goCreate}>
          Create poll
        </Button>
      </div>

      {isPending && <PollListSkeleton />}

      {isError && (
        <ErrorState
          error={error}
          action={
            <Button variant="secondary" icon={ArrowClockwise} onClick={() => void refetch()}>
              Try again
            </Button>
          }
        />
      )}

      {isEmpty && (
        <EmptyState
          icon={ChartBarHorizontal}
          title="No polls yet"
          body="Start a poll to settle your team's next small decision — pick a day, a place, a time — and let everyone weigh in."
          action={
            <Button icon={Plus} onClick={goCreate}>
              Create the first poll
            </Button>
          }
        />
      )}

      {!isPending && !isError && !isEmpty && (
        <div className={styles.sections}>
          <PollSection title="Open" polls={openPolls} onOpen={goDetail} />
          <PollSection title="Closed" polls={closedPolls} onOpen={goDetail} />
        </div>
      )}
    </div>
  );
}
