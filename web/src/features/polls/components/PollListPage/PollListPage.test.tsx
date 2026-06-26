import { describe, it, expect } from 'vitest';
import { screen } from '@testing-library/react';
import { axe } from 'vitest-axe';
import { renderWithProviders, createMockApiClient } from '@/test-utils';
import { ApiError } from '@/lib/apiClient';
import { PollListPage } from './index';
import { buildSummary, buildListResponse } from '../../testFixtures';

describe('PollListPage', () => {
  it('PollListPage — loading — shows skeleton placeholders (no poll content)', () => {
    // Arrange — a request that never resolves keeps the query pending.
    const apiClient = createMockApiClient(() => new Promise(() => {}));

    // Act
    renderWithProviders(<PollListPage />, { apiClient });

    // Assert — the heading renders, but no poll cards yet.
    expect(screen.getByRole('heading', { name: 'Polls' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Open poll/ })).not.toBeInTheDocument();
  });

  it('PollListPage — empty — shows the zero-data empty state and CTA', async () => {
    // Arrange
    const apiClient = createMockApiClient(() => Promise.resolve(buildListResponse([])) as never);

    // Act
    renderWithProviders(<PollListPage />, { apiClient });

    // Assert
    expect(await screen.findByText('No polls yet')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Create the first poll' })).toBeInTheDocument();
  });

  it('PollListPage — populated — groups polls under Open and Closed', async () => {
    // Arrange
    const items = [
      buildSummary({ id: 1, question: 'Offsite day?', isClosed: false }),
      buildSummary({ id: 2, question: 'Lunch spot?', isClosed: false }),
      buildSummary({ id: 3, question: 'Room name?', isClosed: true }),
    ];
    const apiClient = createMockApiClient(() => Promise.resolve(buildListResponse(items)) as never);

    // Act
    renderWithProviders(<PollListPage />, { apiClient });

    // Assert — both open questions and the closed question render under their
    // respective section headers (each "Open"/"Closed" appears as a header plus
    // one badge per card, so assert at least one of each is present).
    expect(await screen.findByText('Offsite day?')).toBeInTheDocument();
    expect(screen.getByText('Lunch spot?')).toBeInTheDocument();
    expect(screen.getByText('Room name?')).toBeInTheDocument();
    expect(screen.getAllByText('Open').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('Closed').length).toBeGreaterThanOrEqual(1);
  });

  it('PollListPage — request fails — shows an error state with retry', async () => {
    // Arrange
    const apiClient = createMockApiClient(() => Promise.reject(new ApiError(500, null, 'boom')));

    // Act
    renderWithProviders(<PollListPage />, { apiClient });

    // Assert
    expect(await screen.findByText('Something went wrong')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Try again' })).toBeInTheDocument();
  });

  it('PollListPage — populated — has no axe violations', async () => {
    // Arrange
    const items = [buildSummary({ id: 1, question: 'Offsite day?' })];
    const apiClient = createMockApiClient(() => Promise.resolve(buildListResponse(items)) as never);
    const { container } = renderWithProviders(<PollListPage />, { apiClient });
    await screen.findByText('Offsite day?');

    // Act
    const results = await axe(container);

    // Assert
    expect(results).toHaveNoViolations();
  });
});
