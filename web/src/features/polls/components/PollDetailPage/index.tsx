import { useCallback, useEffect, useState } from 'react';
import { ArrowLeft, LockSimple, Trash } from '@phosphor-icons/react';
import { Button } from '@/components/Button';
import { Badge } from '@/components/Badge';
import { Avatar } from '@/components/Avatar';
import { Alert } from '@/components/Alert';
import { ErrorState } from '@/components/ErrorState';
import { ConfirmModal } from '@/components/ConfirmModal';
import { ApiError } from '@/lib/apiClient';
import { useNavigation } from '@/store/navigation';
import { usePoll } from '../../hooks/usePoll';
import { useCastVote } from '../../hooks/useCastVote';
import { useClosePoll } from '../../hooks/useClosePoll';
import { useDeletePoll } from '../../hooks/useDeletePoll';
import { totalVotesLabel } from '../../utils';
import { VotingPanel } from './VotingPanel';
import { ResultsPanel } from './ResultsPanel';
import { PollDetailSkeleton } from './PollDetailSkeleton';
import styles from './PollDetailPage.module.css';

/** S4 — Poll detail (vote + results), with owner/admin close & delete. */
export function PollDetailPage({ pollId }: { pollId: number }) {
  const { goList } = useNavigation();
  const { data: poll, isPending, isError, error } = usePoll(pollId);

  const castVote = useCastVote(pollId);
  const closePoll = useClosePoll(pollId);
  const deletePoll = useDeletePoll(pollId);

  // Whether the user has explicitly entered "change my vote" mode.
  const [changing, setChanging] = useState(false);
  const [draftVote, setDraftVote] = useState<number | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);

  // Keep the draft aligned with the server's record of the user's vote.
  useEffect(() => {
    setDraftVote(poll?.myVote ?? null);
  }, [poll?.myVote, poll?.id]);

  const handleCast = useCallback(() => {
    if (draftVote == null) {
      return;
    }
    castVote.mutate({ optionId: draftVote }, { onSuccess: () => setChanging(false) });
  }, [castVote, draftVote]);

  if (isPending) {
    return <PollDetailSkeleton />;
  }

  if (isError) {
    return (
      <div className={styles.page}>
        <ErrorState
          error={error}
          action={
            <Button variant="secondary" icon={ArrowLeft} onClick={goList}>
              Back to polls
            </Button>
          }
        />
      </div>
    );
  }

  const open = !poll.isClosed;
  // A member who has not voted gets resultsVisible:false → must vote first.
  const inVotingMode = open && (changing || !poll.resultsVisible);
  const showCancel = changing || poll.myVote != null;
  // While the poll is open and results are showing, the caller can (re)open the
  // vote UI — to change an existing vote, or to cast one (owner/admin who has
  // results but no vote yet).
  const canChange = open && !inVotingMode;

  return (
    <div className={styles.page}>
      <button type="button" onClick={goList} className={styles.back}>
        <ArrowLeft size={16} weight="regular" aria-hidden="true" />
        <span>Back to polls</span>
      </button>

      <div className={styles.card}>
        <div className={styles.header}>
          <div className={styles.headerMain}>
            <div>
              <Badge variant={open ? 'live' : 'archived'}>{open ? 'Open' : 'Closed'}</Badge>
            </div>
            <h1 className={styles.question}>{poll.question}</h1>
            <div className={styles.ownerLine}>
              <Avatar name={poll.ownerDisplayName} size={24} />
              <span>{poll.isOwner ? 'Created by you' : `Created by ${poll.ownerDisplayName}`}</span>
              <span aria-hidden="true">·</span>
              <span>{totalVotesLabel(poll.totalVotes)}</span>
            </div>
          </div>
          {poll.canManage && (
            <div className={styles.manageActions}>
              {open && (
                <Button
                  variant="secondary"
                  icon={LockSimple}
                  onClick={() => closePoll.mutate()}
                  loading={closePoll.isPending}
                >
                  Close poll
                </Button>
              )}
              <Button variant="secondary" icon={Trash} onClick={() => setConfirmOpen(true)}>
                Delete
              </Button>
            </div>
          )}
        </div>

        <div className={styles.divider} />

        {(castVote.error || closePoll.error) && (
          <Alert severity="error">
            {castVote.error instanceof ApiError && castVote.error.status === 409
              ? 'This poll is now closed, so votes can no longer be changed. Refresh to see the latest results.'
              : 'That action could not be completed just now. Try again in a moment.'}
          </Alert>
        )}

        {inVotingMode ? (
          <VotingPanel
            poll={poll}
            draftVote={draftVote}
            submitting={castVote.isPending}
            showCancel={showCancel}
            onPick={setDraftVote}
            onSubmit={handleCast}
            onCancel={() => {
              setChanging(false);
              setDraftVote(poll.myVote ?? null);
            }}
          />
        ) : (
          <ResultsPanel poll={poll} canChange={canChange} onChange={() => setChanging(true)} />
        )}
      </div>

      <ConfirmModal
        open={confirmOpen}
        title="Delete this poll?"
        confirmLabel="Delete poll"
        cancelLabel="Keep poll"
        confirmIcon={Trash}
        confirmVariant="destructive"
        confirmLoading={deletePoll.isPending}
        onConfirm={() => deletePoll.mutate(undefined, { onSuccess: () => goList() })}
        onCancel={() => setConfirmOpen(false)}
      >
        &ldquo;{poll.question}&rdquo; will be removed for everyone on the team, along with its
        votes. This can&rsquo;t be undone.
      </ConfirmModal>
    </div>
  );
}
