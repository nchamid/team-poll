import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'vitest-axe';
import { Plus } from '@phosphor-icons/react';
import { Button } from './index';

describe('Button', () => {
  it('Button — default — renders an accessible button with its label', () => {
    // Arrange / Act
    render(<Button>Create poll</Button>);

    // Assert
    expect(screen.getByRole('button', { name: 'Create poll' })).toBeInTheDocument();
  });

  it('Button — click — invokes the handler', async () => {
    // Arrange
    const onClick = vi.fn();
    const user = userEvent.setup();
    render(<Button onClick={onClick}>Save</Button>);

    // Act
    await user.click(screen.getByRole('button', { name: 'Save' }));

    // Assert
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('Button — loading — is disabled and marked busy', () => {
    // Arrange / Act
    render(
      <Button loading icon={Plus}>
        Create poll
      </Button>,
    );

    // Assert
    const sut = screen.getByRole('button', { name: 'Create poll' });
    expect(sut).toBeDisabled();
    expect(sut).toHaveAttribute('aria-busy', 'true');
  });

  it('Button — disabled — does not fire its handler', async () => {
    // Arrange — bypass the pointer-events check so the click is attempted on the
    // disabled (pointer-events:none) button and we can assert nothing fires.
    const onClick = vi.fn();
    const user = userEvent.setup({ pointerEventsCheck: 0 });
    render(
      <Button disabled onClick={onClick}>
        Save
      </Button>,
    );
    const sut = screen.getByRole('button', { name: 'Save' });

    // Act
    await user.click(sut);

    // Assert
    expect(sut).toBeDisabled();
    expect(onClick).not.toHaveBeenCalled();
  });

  it('Button — has no axe violations', async () => {
    // Arrange
    const { container } = render(<Button icon={Plus}>Create poll</Button>);

    // Act
    const results = await axe(container);

    // Assert
    expect(results).toHaveNoViolations();
  });
});
