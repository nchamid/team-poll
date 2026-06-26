import { describe, it, expect, vi } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'vitest-axe';
import { renderWithProviders, createMockApiClient } from '@/test-utils';
import { type ApiClient } from '@/lib/apiClient';
import { CreatePollPage } from './index';

describe('CreatePollPage', () => {
  it('CreatePollPage — initial — shows two option fields and the 2 of 6 counter', () => {
    // Arrange / Act
    renderWithProviders(<CreatePollPage />);

    // Assert
    expect(screen.getByLabelText('Option 1')).toBeInTheDocument();
    expect(screen.getByLabelText('Option 2')).toBeInTheDocument();
    expect(screen.getByText('2 of 6 options')).toBeInTheDocument();
  });

  it('CreatePollPage — submit empty — shows the validation summary and field errors', async () => {
    // Arrange
    const request = vi.fn();
    const apiClient = createMockApiClient(request as unknown as ApiClient['request']);
    const user = userEvent.setup();
    renderWithProviders(<CreatePollPage />, { apiClient });

    // Act
    await user.click(screen.getByRole('button', { name: 'Create poll' }));

    // Assert — summary alert shown and nothing submitted.
    expect(await screen.findByText(/need attention/i)).toBeInTheDocument();
    expect(screen.getByText(/Add a question/i)).toBeInTheDocument();
    expect(request).not.toHaveBeenCalled();
  });

  it('CreatePollPage — add option — adds rows up to six then disables Add', async () => {
    // Arrange
    const user = userEvent.setup();
    renderWithProviders(<CreatePollPage />);
    const addButton = screen.getByRole('button', { name: 'Add option' });

    // Act — add four more to reach six.
    await user.click(addButton);
    await user.click(addButton);
    await user.click(addButton);
    await user.click(addButton);

    // Assert
    expect(screen.getByText('6 of 6 options')).toBeInTheDocument();
    expect(addButton).toBeDisabled();
  });

  it('CreatePollPage — remove control hidden at two options — appears after adding', async () => {
    // Arrange
    const user = userEvent.setup();
    renderWithProviders(<CreatePollPage />);

    // Assert — at the two-option minimum, no remove controls.
    expect(screen.queryByRole('button', { name: /Remove option/ })).not.toBeInTheDocument();

    // Act
    await user.click(screen.getByRole('button', { name: 'Add option' }));

    // Assert — remove controls now present.
    expect(screen.getAllByRole('button', { name: /Remove option/ })).toHaveLength(3);
  });

  it('CreatePollPage — valid submit — posts the poll payload', async () => {
    // Arrange
    const request = vi.fn().mockResolvedValue({ pollId: 42 });
    const apiClient = createMockApiClient(request as unknown as ApiClient['request']);
    const user = userEvent.setup();
    renderWithProviders(<CreatePollPage />, { apiClient });

    // Act
    await user.type(screen.getByLabelText('Question'), 'Which day for the offsite?');
    await user.type(screen.getByLabelText('Option 1'), 'Monday');
    await user.type(screen.getByLabelText('Option 2'), 'Tuesday');
    await user.click(screen.getByRole('button', { name: 'Create poll' }));

    // Assert
    await waitFor(() => expect(request).toHaveBeenCalledTimes(1));
    const [, options] = request.mock.calls[0];
    expect(options).toMatchObject({
      method: 'POST',
      body: { question: 'Which day for the offsite?', options: ['Monday', 'Tuesday'] },
    });
  });

  it('CreatePollPage — has no axe violations', async () => {
    // Arrange
    const { container } = renderWithProviders(<CreatePollPage />);

    // Act
    const results = await axe(container);

    // Assert
    expect(results).toHaveNoViolations();
  });
});
