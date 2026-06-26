import { QUESTION_MAX_LENGTH, OPTION_MAX_LENGTH, MIN_OPTIONS, MAX_OPTIONS } from '@/lib/constants';

export interface CreatePollDraft {
  question: string;
  options: string[];
}

export interface CreatePollValidation {
  question: string;
  options: string[];
  ok: boolean;
}

/**
 * Validates a create-poll draft against the same bounds the server enforces:
 * question 1–280 (overrides the prototype's 140 per the reconciliation log),
 * 2–6 options, each 1–80. Returns per-field messages and an overall `ok` flag.
 */
export function validateCreatePoll(draft: CreatePollDraft): CreatePollValidation {
  const trimmedQuestion = draft.question.trim();
  let question = '';
  if (!trimmedQuestion) {
    question = 'Add a question so people know what they are voting on.';
  } else if (draft.question.length > QUESTION_MAX_LENGTH) {
    question = `Keep the question under ${QUESTION_MAX_LENGTH} characters.`;
  }

  const options = draft.options.map((value) => {
    if (!value.trim()) {
      return 'Add a label, or remove this option.';
    }
    if (value.length > OPTION_MAX_LENGTH) {
      return `Keep options under ${OPTION_MAX_LENGTH} characters.`;
    }
    return '';
  });

  const enoughOptions = draft.options.length >= MIN_OPTIONS && draft.options.length <= MAX_OPTIONS;
  const ok = !question && options.every((message) => !message) && enoughOptions;

  return { question, options, ok };
}

/** Builds the "N of 6 options" counter label. */
export function optionCountLabel(count: number): string {
  return `${count} of ${MAX_OPTIONS} options`;
}

/** Formats a vote count meta string, e.g. "4 options · 23 votes". */
export function pollMeta(optionCount: number, totalVotes: number): string {
  const options = `${optionCount} ${optionCount === 1 ? 'option' : 'options'}`;
  const votes = `${totalVotes} ${totalVotes === 1 ? 'vote' : 'votes'}`;
  return `${options} · ${votes}`;
}

/** Total-votes label for a poll header, e.g. "23 votes total" / "No votes yet". */
export function totalVotesLabel(total: number): string {
  if (total === 0) {
    return 'No votes yet';
  }
  return `${total} ${total === 1 ? 'vote total' : 'votes total'}`;
}
