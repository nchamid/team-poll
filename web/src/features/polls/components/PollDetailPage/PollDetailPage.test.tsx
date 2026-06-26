import { describe, it, expect, vi } from 'vitest';
import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'vitest-axe';
import { renderWithProviders, createMockApiClient } from '@/test-utils';
import { type ApiClient } from '@/lib/apiClient';
import { type PollDetail } from '../../types';
import { PollDetailPage } from './index';
import { buildDetailWithResults, buildDetailVotingState } from '../../testFixtures';

/** Builds an ApiClient whose GET returns `detail` and whose mutations resolve. */
function clientFor(detail: PollDetail, mutationResult: PollDetail = detail): ApiClient {
  const request = vi.fn((_url: string, options?: { method?: string }) => {
    const method = options?.method ?? 'GET';
    if (method === 'GET') {
      return Promise.resolve(detail);
    }
    return Promise.resolve(mutationResult);
  });
  return createMockApiClient(request as unknown as ApiClient['request']);
}

describe('PollDetailPage', () => {
  it('PollDetailPage — member not voted — shows the voting radio group, not results', async () => {
    // Arrange
    const apiClient = clientFor(buildDetailVotingState());

    // Act
    renderWithProviders(<PollDetailPage pollId={2} />, { apiClient });

    // Assert — pick rows present, no result bars.
    expect(await screen.findByRole('radiogroup', { name: 'Poll options' })).toBeInTheDocument();
    expect(screen.getAllByRole('radio')).toHaveLength(3);
    expect(screen.queryByText(/Your vote/)).not.toBeInTheDocument();
  });

  it('PollDetailPage — member who voted — shows results with the Your vote marker', async () => {
    // Arrange
    const apiClient = clientFor(buildDetailWithResults());

    // Act
    renderWithProviders(<PollDetailPage pollId={1} />, { apiClient });

    // Assert
    expect(await screen.findByText('Your vote')).toBeInTheDocument();
    expect(screen.getByText('60%')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Change vote' })).toBeInTheDocument();
  });

  it('PollDetailPage — closed poll — is read-only with no vote action', async () => {
    // Arrange
    const apiClient = clientFor(buildDetailWithResults({ isClosed: true, canManage: false }));

    // Act
    renderWithProviders(<PollDetailPage pollId={1} />, { apiClient });

    // Assert
    expect(await screen.findByText('Closed')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Change vote' })).not.toBeInTheDocument();
    expect(screen.queryByRole('radiogroup')).not.toBeInTheDocument();
  });

  it('PollDetailPage — casting a vote — sends a PUT with the chosen option', async () => {
    // Arrange
    const detail = buildDetailVotingState();
    const request = vi.fn((_url: string, options?: { method?: string }) => {
      if ((options?.method ?? 'GET') === 'GET') {
        return Promise.resolve(detail);
      }
      return Promise.resolve(buildDetailWithResults());
    });
    const apiClient = createMockApiClient(request as unknown as ApiClient['request']);
    const user = userEvent.setup();
    renderWithProviders(<PollDetailPage pollId={2} />, { apiClient });

    // Act
    const firstOption = (await screen.findAllByRole('radio'))[0];
    await user.click(firstOption);
    await user.click(screen.getByRole('button', { name: 'Cast vote' }));

    // Assert
    await waitFor(() => {
      const putCall = request.mock.calls.find((call) => call[1]?.method === 'PUT');
      expect(putCall).toBeDefined();
      expect(putCall?.[1]).toMatchObject({ body: { optionId: 20 } });
    });
  });

  it('PollDetailPage — owner — shows Close and Delete, and Delete opens a naming confirm', async () => {
    // Arrange
    const apiClient = clientFor(buildDetailWithResults({ isOwner: true, canManage: true }));
    const user = userEvent.setup();
    renderWithProviders(<PollDetailPage pollId={1} />, { apiClient });
    await screen.findByText('Created by you');

    // Act
    await user.click(screen.getByRole('button', { name: 'Delete' }));

    // Assert — modal names the poll's question (scoped to the dialog, since the
    // same question also appears in the page header).
    const dialog = await screen.findByRole('dialog');
    expect(within(dialog).getByText(/Which day works best for the offsite/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Close poll' })).toBeInTheDocument();
  });

  it('PollDetailPage — request fails — shows an error state with a way back', async () => {
    // Arrange
    const apiClient = createMockApiClient(() => Promise.reject(new Error('network down')));

    // Act
    renderWithProviders(<PollDetailPage pollId={1} />, { apiClient });

    // Assert
    expect(await screen.findByText('Something went wrong')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Back to polls' })).toBeInTheDocument();
  });

  it('PollDetailPage — results state — has no axe violations', async () => {
    // Arrange
    const apiClient = clientFor(buildDetailWithResults());
    const { container } = renderWithProviders(<PollDetailPage pollId={1} />, { apiClient });
    await screen.findByText('Your vote');

    // Act
    const results = await axe(container);

    // Assert
    expect(results).toHaveNoViolations();
  });

  it('PollDetailPage — voting state — has no axe violations', async () => {
    // Arrange
    const apiClient = clientFor(buildDetailVotingState());
    const { container } = renderWithProviders(<PollDetailPage pollId={2} />, { apiClient });
    await screen.findByRole('radiogroup');

    // Act
    const results = await axe(container);

    // Assert
    expect(results).toHaveNoViolations();
  });
});
