import { describe, it, expect } from 'vitest';
import { ApiError } from '@/lib/apiClient';
import { buildUrl } from '@/lib/url';
import {
  type CreatePollResponse,
  type PollDetail,
  type PollListResponse,
} from '@features/polls/types';
import { createMockApiClient } from './mockApiClient';

/** Seed reference (seedData.ts): poll 1 — owned, voted (option 11); poll 2 —
 * not voted (options 20–23); poll 4 — closed. */

describe('createMockApiClient', () => {
  it('list — open polls — returns them before closed polls', async () => {
    // Arrange
    const sut = createMockApiClient();

    // Act
    const result = await sut.request<PollListResponse>(buildUrl('/api/polls'));

    // Assert
    expect(result.items).toHaveLength(5);
    expect(result.totalCount).toBe(5);
    expect(result.items.slice(0, 3).every((poll) => !poll.isClosed)).toBe(true);
    expect(result.items.slice(3).every((poll) => poll.isClosed)).toBe(true);
  });

  it('detail — caller has not voted — gates the per-option counts', async () => {
    // Arrange
    const sut = createMockApiClient();

    // Act
    const result = await sut.request<PollDetail>(buildUrl('/api/polls/2'));

    // Assert
    expect(result.myVote).toBeNull();
    expect(result.resultsVisible).toBe(false);
    expect(result.options.every((option) => option.voteCount === null)).toBe(true);
    expect(result.options.every((option) => option.percentage === null)).toBe(true);
  });

  it('detail — caller has voted — exposes counts and percentages', async () => {
    // Arrange
    const sut = createMockApiClient();

    // Act
    const result = await sut.request<PollDetail>(buildUrl('/api/polls/1'));

    // Assert
    expect(result.resultsVisible).toBe(true);
    expect(result.myVote).toBe(11);
    expect(result.totalVotes).toBe(18);
    expect(result.options.find((option) => option.id === 11)?.voteCount).toBe(9);
  });

  it('vote — first vote — increments the option and reveals results', async () => {
    // Arrange
    const sut = createMockApiClient();

    // Act
    const result = await sut.request<PollDetail>(buildUrl('/api/polls/2/vote'), {
      method: 'PUT',
      body: { optionId: 23 },
    });

    // Assert
    expect(result.resultsVisible).toBe(true);
    expect(result.myVote).toBe(23);
    expect(result.totalVotes).toBe(17);
    expect(result.options.find((option) => option.id === 23)?.voteCount).toBe(7);
  });

  it('vote — changed vote — moves the count and keeps the total', async () => {
    // Arrange
    const sut = createMockApiClient();

    // Act
    const result = await sut.request<PollDetail>(buildUrl('/api/polls/1/vote'), {
      method: 'PUT',
      body: { optionId: 10 },
    });

    // Assert
    expect(result.myVote).toBe(10);
    expect(result.totalVotes).toBe(18);
    expect(result.options.find((option) => option.id === 10)?.voteCount).toBe(5);
    expect(result.options.find((option) => option.id === 11)?.voteCount).toBe(8);
  });

  it('vote — poll is closed — throws a 409 ApiError', async () => {
    // Arrange
    const sut = createMockApiClient();

    // Act
    const act = sut.request<PollDetail>(buildUrl('/api/polls/4/vote'), {
      method: 'PUT',
      body: { optionId: 42 },
    });

    // Assert
    await expect(act).rejects.toMatchObject({ status: 409 });
    await expect(act).rejects.toBeInstanceOf(ApiError);
  });

  it('vote — option not on the poll — throws a 400 ApiError', async () => {
    // Arrange
    const sut = createMockApiClient();

    // Act
    const act = sut.request<PollDetail>(buildUrl('/api/polls/2/vote'), {
      method: 'PUT',
      body: { optionId: 999 },
    });

    // Assert
    await expect(act).rejects.toMatchObject({ status: 400 });
  });

  it('create — new poll — lands at the top of the list and returns its id', async () => {
    // Arrange
    const sut = createMockApiClient();

    // Act
    const created = await sut.request<CreatePollResponse>(buildUrl('/api/polls'), {
      method: 'POST',
      body: { question: 'Tabs or spaces?', options: ['Tabs', 'Spaces'] },
    });
    const list = await sut.request<PollListResponse>(buildUrl('/api/polls'));

    // Assert
    expect(created.pollId).toBe(6);
    expect(list.items[0].id).toBe(6);
    expect(list.items[0].isClosed).toBe(false);
    expect(list.items[0].optionCount).toBe(2);
  });

  it('close — open poll — marks it closed', async () => {
    // Arrange
    const sut = createMockApiClient();

    // Act
    await sut.request<void>(buildUrl('/api/polls/1/close'), { method: 'POST' });
    const detail = await sut.request<PollDetail>(buildUrl('/api/polls/1'));

    // Assert
    expect(detail.isClosed).toBe(true);
  });

  it('delete — existing poll — removes it from the list and 404s on detail', async () => {
    // Arrange
    const sut = createMockApiClient();

    // Act
    await sut.request<void>(buildUrl('/api/polls/2'), { method: 'DELETE' });
    const list = await sut.request<PollListResponse>(buildUrl('/api/polls'));

    // Assert
    expect(list.items).toHaveLength(4);
    expect(list.items.find((poll) => poll.id === 2)).toBeUndefined();
    await expect(sut.request<PollDetail>(buildUrl('/api/polls/2'))).rejects.toMatchObject({
      status: 404,
    });
  });

  it('request — unknown route — throws a 404 ApiError', async () => {
    // Arrange
    const sut = createMockApiClient();

    // Act
    const act = sut.request(buildUrl('/api/unknown'));

    // Assert
    await expect(act).rejects.toBeInstanceOf(ApiError);
    await expect(act).rejects.toMatchObject({ status: 404 });
  });
});
