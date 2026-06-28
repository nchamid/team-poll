/**
 * In-memory mock of the Team Poll API for the static GitHub Pages demo
 * (VITE_DEMO_MODE). It implements the same `ApiClient` surface the real
 * MSAL-backed client exposes — a single `request<T>(url, options)` — so every
 * data hook works unchanged against synthetic data, with no network and no
 * sign-in. State lives in module memory; reloading the page resets it.
 *
 * Behaviour mirrors the real API where the UI depends on it: results are gated
 * until the caller has voted (or owns the poll, or it is closed), and a vote on
 * a closed poll returns a 409 ApiError — the case PollDetailPage surfaces with a
 * "this poll is now closed" message.
 */
import { ApiError, type ApiClient, type ProblemDetails } from '@/lib/apiClient';
import {
  type CastVoteRequest,
  type CreatePollRequest,
  type CreatePollResponse,
  type PollDetail,
  type PollListResponse,
  type PollOptionDetail,
  type PollSummary,
} from '@features/polls/types';
import { buildSeedPolls, DEMO_USER_DISPLAY_NAME, type DemoOption, type DemoPoll } from './seedData';

/** Network-feel delay so loading skeletons and optimistic states are visible. */
const READ_LATENCY_MS = 220;
const WRITE_LATENCY_MS = 320;

function problem(status: number, detail: string): ProblemDetails {
  return { status, title: detail, detail };
}

/** Resolve after `ms`, rejecting early if the request was aborted. */
function delay(ms: number, signal?: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    if (signal?.aborted) {
      reject(new DOMException('Aborted', 'AbortError'));
      return;
    }
    const timer = setTimeout(resolve, ms);
    signal?.addEventListener(
      'abort',
      () => {
        clearTimeout(timer);
        reject(new DOMException('Aborted', 'AbortError'));
      },
      { once: true },
    );
  });
}

function totalVotes(poll: DemoPoll): number {
  return poll.options.reduce((sum, option) => sum + option.voteCount, 0);
}

/** Results are visible once the caller has a stake in them: they voted, they
 * own/manage the poll, or the poll is closed. Mirrors the API's gating. */
function resultsVisible(poll: DemoPoll): boolean {
  return poll.isClosed || poll.isOwner || poll.myVote != null;
}

function toSummary(poll: DemoPoll): PollSummary {
  return {
    id: poll.id,
    question: poll.question,
    optionCount: poll.options.length,
    totalVotes: totalVotes(poll),
    isClosed: poll.isClosed,
    ownerDisplayName: poll.ownerDisplayName,
    isOwner: poll.isOwner,
    canManage: poll.isOwner,
  };
}

function toOptionDetail(option: DemoOption, total: number, visible: boolean): PollOptionDetail {
  return {
    id: option.id,
    text: option.text,
    displayOrder: option.displayOrder,
    voteCount: visible ? option.voteCount : null,
    percentage:
      visible && total > 0 ? Math.round((option.voteCount / total) * 100) : visible ? 0 : null,
  };
}

function toDetail(poll: DemoPoll): PollDetail {
  const visible = resultsVisible(poll);
  const total = totalVotes(poll);
  return {
    id: poll.id,
    question: poll.question,
    isClosed: poll.isClosed,
    ownerDisplayName: poll.ownerDisplayName,
    isOwner: poll.isOwner,
    canManage: poll.isOwner,
    totalVotes: total,
    myVote: poll.myVote,
    resultsVisible: visible,
    options: [...poll.options]
      .sort((first, second) => first.displayOrder - second.displayOrder)
      .map((option) => toOptionDetail(option, total, visible)),
  };
}

/** Holds the mutable demo dataset and the id sequences for new polls/options. */
class DemoStore {
  private polls: DemoPoll[] = buildSeedPolls();
  private nextPollId = 6;
  private nextOptionId = 1000;

  private find(id: number): DemoPoll {
    const poll = this.polls.find((candidate) => candidate.id === id && !candidate.isDeleted);
    if (!poll) {
      throw new ApiError(404, problem(404, 'That poll could not be found.'), 'Not found');
    }
    return poll;
  }

  list(): PollListResponse {
    const active = this.polls.filter((poll) => !poll.isDeleted);
    // Open polls first, then closed — matching the API's ordering.
    const ordered = [
      ...active.filter((poll) => !poll.isClosed),
      ...active.filter((poll) => poll.isClosed),
    ];
    const items = ordered.map(toSummary);
    return { items, page: 1, pageSize: items.length, totalCount: items.length };
  }

  detail(id: number): PollDetail {
    return toDetail(this.find(id));
  }

  create(request: CreatePollRequest): CreatePollResponse {
    const poll: DemoPoll = {
      id: this.nextPollId++,
      question: request.question.trim(),
      isClosed: false,
      ownerDisplayName: DEMO_USER_DISPLAY_NAME,
      isOwner: true,
      myVote: null,
      isDeleted: false,
      options: request.options.map((text, index) => ({
        id: this.nextOptionId++,
        text: text.trim(),
        displayOrder: index,
        voteCount: 0,
      })),
    };
    // New poll surfaces at the top of the Open section.
    this.polls.unshift(poll);
    return { pollId: poll.id };
  }

  vote(id: number, request: CastVoteRequest): PollDetail {
    const poll = this.find(id);
    if (poll.isClosed) {
      throw new ApiError(409, problem(409, 'This poll is closed.'), 'Conflict');
    }
    const option = poll.options.find((candidate) => candidate.id === request.optionId);
    if (!option) {
      throw new ApiError(400, problem(400, 'That option is not part of this poll.'), 'Bad request');
    }
    if (poll.myVote === option.id) {
      return toDetail(poll);
    }
    if (poll.myVote != null) {
      const previous = poll.options.find((candidate) => candidate.id === poll.myVote);
      if (previous) {
        previous.voteCount = Math.max(0, previous.voteCount - 1);
      }
    }
    option.voteCount += 1;
    poll.myVote = option.id;
    return toDetail(poll);
  }

  close(id: number): void {
    this.find(id).isClosed = true;
  }

  remove(id: number): void {
    this.find(id).isDeleted = true;
  }
}

interface RouteContext {
  method: string;
  path: string;
  body: unknown;
}

/** Match `/api/polls/{id}{suffix}` and return the numeric id, or null. */
function matchPollPath(path: string, suffix: string): number | null {
  const match = new RegExp(`^/api/polls/(\\d+)${suffix}$`).exec(path);
  return match ? Number(match[1]) : null;
}

function route(store: DemoStore, { method, path, body }: RouteContext): unknown {
  if (path === '/api/polls') {
    if (method === 'GET') {
      return store.list();
    }
    if (method === 'POST') {
      return store.create(body as CreatePollRequest);
    }
  }

  const voteId = matchPollPath(path, '/vote');
  if (voteId != null && method === 'PUT') {
    return store.vote(voteId, body as CastVoteRequest);
  }

  const closeId = matchPollPath(path, '/close');
  if (closeId != null && method === 'POST') {
    store.close(closeId);
    return undefined;
  }

  const detailId = matchPollPath(path, '');
  if (detailId != null) {
    if (method === 'GET') {
      return store.detail(detailId);
    }
    if (method === 'DELETE') {
      store.remove(detailId);
      return undefined;
    }
  }

  throw new ApiError(404, problem(404, `No demo route for ${method} ${path}.`), 'Not found');
}

/** Build an ApiClient backed by the in-memory demo store. */
export function createMockApiClient(): ApiClient {
  const store = new DemoStore();

  async function request<T>(
    url: string,
    options: { method?: string; body?: unknown; signal?: AbortSignal } = {},
  ): Promise<T> {
    const method = options.method ?? 'GET';
    // The app builds same-origin paths (VITE_API_BASE_URL is unset in demo), so
    // a dummy base lets URL parse the path and strip the query string.
    const path = new URL(url, 'http://demo.local').pathname;
    await delay(method === 'GET' ? READ_LATENCY_MS : WRITE_LATENCY_MS, options.signal);
    return route(store, { method, path, body: options.body }) as T;
  }

  return { request };
}
