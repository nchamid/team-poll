import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { createApiClient, ApiError } from './apiClient';

describe('createApiClient', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('request — successful JSON — returns the parsed body with a bearer token', async () => {
    // Arrange
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ pollId: 7 }), {
        status: 200,
        headers: { 'content-type': 'application/json' },
      }),
    );
    vi.stubGlobal('fetch', fetchMock);
    const sut = createApiClient(() => Promise.resolve('token-123'));

    // Act
    const result = await sut.request<{ pollId: number }>('/api/polls');

    // Assert
    expect(result).toEqual({ pollId: 7 });
    const [, init] = fetchMock.mock.calls[0];
    expect(init.headers.Authorization).toBe('Bearer token-123');
  });

  it('request — 204 No Content — resolves to undefined', async () => {
    // Arrange
    const fetchMock = vi.fn().mockResolvedValue(new Response(null, { status: 204 }));
    vi.stubGlobal('fetch', fetchMock);
    const sut = createApiClient(() => Promise.resolve('token'));

    // Act
    const result = await sut.request<void>('/api/polls/1', { method: 'DELETE' });

    // Assert
    expect(result).toBeUndefined();
  });

  it('request — ProblemDetails error — throws an ApiError carrying status and detail', async () => {
    // Arrange
    const problem = { status: 403, title: 'Forbidden', detail: 'You do not own this poll.' };
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify(problem), {
        status: 403,
        headers: { 'content-type': 'application/problem+json' },
      }),
    );
    vi.stubGlobal('fetch', fetchMock);
    const sut = createApiClient(() => Promise.resolve('token'));

    // Act / Assert
    await expect(sut.request('/api/polls/1/close', { method: 'POST' })).rejects.toMatchObject({
      status: 403,
    });
  });

  it('request — validation error — exposes field errors on the ApiError', async () => {
    // Arrange
    const problem = { status: 400, errors: { question: ['Add a question.'] } };
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify(problem), {
        status: 400,
        headers: { 'content-type': 'application/problem+json' },
      }),
    );
    vi.stubGlobal('fetch', fetchMock);
    const sut = createApiClient(() => Promise.resolve('token'));

    // Act
    let caught: unknown;
    try {
      await sut.request('/api/polls', { method: 'POST', body: {} });
    } catch (error) {
      caught = error;
    }

    // Assert
    expect(caught).toBeInstanceOf(ApiError);
    expect((caught as ApiError).fieldErrors).toEqual({ question: ['Add a question.'] });
  });
});
