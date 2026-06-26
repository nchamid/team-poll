import {
  type PollSummary,
  type PollDetail,
  type PollListResponse,
  type PollOptionDetail,
} from './types';

/** Shared test fixtures for poll components/hooks. */

export function buildSummary(overrides: Partial<PollSummary> = {}): PollSummary {
  return {
    id: 1,
    question: 'Which day works best for the offsite?',
    optionCount: 3,
    totalVotes: 12,
    isClosed: false,
    ownerDisplayName: 'Mara Lindqvist',
    isOwner: false,
    canManage: false,
    ...overrides,
  };
}

export function buildListResponse(items: PollSummary[]): PollListResponse {
  return { items, page: 1, pageSize: 50, totalCount: items.length };
}

function buildOption(overrides: Partial<PollOptionDetail> = {}): PollOptionDetail {
  return {
    id: 10,
    text: 'Monday',
    displayOrder: 0,
    voteCount: null,
    percentage: null,
    ...overrides,
  };
}

/** A poll whose results are visible (post-vote member, or owner/admin). */
export function buildDetailWithResults(overrides: Partial<PollDetail> = {}): PollDetail {
  return {
    id: 1,
    question: 'Which day works best for the offsite?',
    isClosed: false,
    ownerDisplayName: 'Mara Lindqvist',
    isOwner: false,
    canManage: false,
    totalVotes: 10,
    myVote: 11,
    resultsVisible: true,
    options: [
      buildOption({ id: 10, text: 'Monday', displayOrder: 0, voteCount: 3, percentage: 30 }),
      buildOption({ id: 11, text: 'Tuesday', displayOrder: 1, voteCount: 6, percentage: 60 }),
      buildOption({ id: 12, text: 'Wednesday', displayOrder: 2, voteCount: 1, percentage: 10 }),
    ],
    ...overrides,
  };
}

/** A poll a member has not voted on yet — results gated, counts null. */
export function buildDetailVotingState(overrides: Partial<PollDetail> = {}): PollDetail {
  return {
    id: 2,
    question: 'Where should we go for lunch?',
    isClosed: false,
    ownerDisplayName: 'Devin Osei',
    isOwner: false,
    canManage: false,
    totalVotes: 7,
    myVote: null,
    resultsVisible: false,
    options: [
      buildOption({ id: 20, text: 'Tacos', displayOrder: 0 }),
      buildOption({ id: 21, text: 'Sandwiches', displayOrder: 1 }),
      buildOption({ id: 22, text: 'Salad', displayOrder: 2 }),
    ],
    ...overrides,
  };
}
