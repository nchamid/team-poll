import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'vitest-axe';
import { PollCard } from './index';
import { buildSummary } from '../../testFixtures';

describe('PollCard', () => {
  it('PollCard — renders — shows question, badge, owner, and meta', () => {
    // Arrange
    const poll = buildSummary({ question: 'Offsite day?', optionCount: 4, totalVotes: 23 });

    // Act
    render(<PollCard poll={poll} onOpen={() => {}} />);

    // Assert
    expect(screen.getByText('Offsite day?')).toBeInTheDocument();
    expect(screen.getByText('Open')).toBeInTheDocument();
    expect(screen.getByText('4 options · 23 votes')).toBeInTheDocument();
  });

  it('PollCard — closed poll — shows the Closed badge', () => {
    // Arrange
    const poll = buildSummary({ isClosed: true });

    // Act
    render(<PollCard poll={poll} onOpen={() => {}} />);

    // Assert
    expect(screen.getByText('Closed')).toBeInTheDocument();
  });

  it('PollCard — click — opens the poll by id', async () => {
    // Arrange
    const onOpen = vi.fn();
    const poll = buildSummary({ id: 99 });
    const user = userEvent.setup();
    render(<PollCard poll={poll} onOpen={onOpen} />);

    // Act
    await user.click(screen.getByRole('button', { name: /Open poll/ }));

    // Assert
    expect(onOpen).toHaveBeenCalledWith(99);
  });

  it('PollCard — Enter key — activates the open handler', async () => {
    // Arrange
    const onOpen = vi.fn();
    const poll = buildSummary({ id: 7 });
    const user = userEvent.setup();
    render(<PollCard poll={poll} onOpen={onOpen} />);

    // Act
    const sut = screen.getByRole('button', { name: /Open poll/ });
    sut.focus();
    await user.keyboard('{Enter}');

    // Assert
    expect(onOpen).toHaveBeenCalledWith(7);
  });

  it('PollCard — has no axe violations', async () => {
    // Arrange
    const { container } = render(<PollCard poll={buildSummary()} onOpen={() => {}} />);

    // Act
    const results = await axe(container);

    // Assert
    expect(results).toHaveNoViolations();
  });
});
