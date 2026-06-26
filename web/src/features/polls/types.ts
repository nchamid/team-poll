/**
 * Poll feature types — mirror the API contract (plan §3). All JSON is camelCase.
 */

export interface PollSummary {
  id: number;
  question: string;
  optionCount: number;
  totalVotes: number;
  isClosed: boolean;
  ownerDisplayName: string;
  isOwner: boolean;
  canManage: boolean;
}

export interface PollListResponse {
  items: PollSummary[];
  page: number;
  pageSize: number;
  totalCount: number;
}

export interface PollOptionDetail {
  id: number;
  text: string;
  displayOrder: number;
  /** Per-option count — null unless results are visible to the caller. */
  voteCount: number | null;
  /** Per-option percentage — null unless results are visible to the caller. */
  percentage: number | null;
}

export interface PollDetail {
  id: number;
  question: string;
  isClosed: boolean;
  ownerDisplayName: string;
  isOwner: boolean;
  canManage: boolean;
  totalVotes: number;
  /** The caller's chosen option id, or null if they have not voted. */
  myVote: number | null;
  /** Whether per-option counts/percentages are populated for the caller. */
  resultsVisible: boolean;
  options: PollOptionDetail[];
}

export interface CreatePollRequest {
  question: string;
  options: string[];
}

export interface CreatePollResponse {
  pollId: number;
}

export interface CastVoteRequest {
  optionId: number;
}
