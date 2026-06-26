import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'vitest-axe';
import { ConfirmModal } from './index';

const baseProps = {
  title: 'Delete this poll?',
  confirmLabel: 'Delete poll',
  cancelLabel: 'Keep poll',
  onConfirm: () => {},
  onCancel: () => {},
};

describe('ConfirmModal', () => {
  it('ConfirmModal — closed — renders nothing', () => {
    // Arrange / Act
    render(
      <ConfirmModal {...baseProps} open={false}>
        Body
      </ConfirmModal>,
    );

    // Assert
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('ConfirmModal — open — shows a modal dialog named by its title', () => {
    // Arrange / Act
    render(
      <ConfirmModal {...baseProps} open>
        This will be removed for everyone.
      </ConfirmModal>,
    );

    // Assert
    const sut = screen.getByRole('dialog');
    expect(sut).toHaveAttribute('aria-modal', 'true');
    expect(screen.getByRole('heading', { name: 'Delete this poll?' })).toBeInTheDocument();
  });

  it('ConfirmModal — confirm click — invokes onConfirm', async () => {
    // Arrange
    const onConfirm = vi.fn();
    const user = userEvent.setup();
    render(
      <ConfirmModal {...baseProps} open onConfirm={onConfirm}>
        Body
      </ConfirmModal>,
    );

    // Act
    await user.click(screen.getByRole('button', { name: 'Delete poll' }));

    // Assert
    expect(onConfirm).toHaveBeenCalledTimes(1);
  });

  it('ConfirmModal — Escape key — invokes onCancel', async () => {
    // Arrange
    const onCancel = vi.fn();
    const user = userEvent.setup();
    render(
      <ConfirmModal {...baseProps} open onCancel={onCancel}>
        Body
      </ConfirmModal>,
    );

    // Act
    await user.keyboard('{Escape}');

    // Assert
    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  it('ConfirmModal — open — has no axe violations', async () => {
    // Arrange
    const { container } = render(
      <ConfirmModal {...baseProps} open>
        This will be removed for everyone.
      </ConfirmModal>,
    );

    // Act
    const results = await axe(container);

    // Assert
    expect(results).toHaveNoViolations();
  });
});
