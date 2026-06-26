import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { axe } from 'vitest-axe';
import { Input } from './index';

describe('Input', () => {
  it('Input — with label — associates the label with the field', () => {
    // Arrange / Act
    render(<Input label="Question" value="" onChange={() => {}} />);

    // Assert
    expect(screen.getByLabelText('Question')).toBeInTheDocument();
  });

  it('Input — error — marks the field invalid and shows the message', () => {
    // Arrange / Act
    render(<Input label="Question" value="" error="Add a question." onChange={() => {}} />);

    // Assert
    const sut = screen.getByLabelText('Question');
    expect(sut).toHaveAttribute('aria-invalid', 'true');
    expect(screen.getByText('Add a question.')).toBeInTheDocument();
  });

  it('Input — showCount — renders the live character counter', () => {
    // Arrange / Act
    render(<Input label="Question" value="Hello" maxLength={280} showCount onChange={() => {}} />);

    // Assert
    expect(screen.getByText('5/280')).toBeInTheDocument();
  });

  it('Input — helper hidden on error — error replaces the helper text', () => {
    // Arrange / Act
    render(
      <Input
        label="Question"
        helper="Keep it short."
        error="Add a question."
        value=""
        onChange={() => {}}
      />,
    );

    // Assert
    expect(screen.queryByText('Keep it short.')).not.toBeInTheDocument();
    expect(screen.getByText('Add a question.')).toBeInTheDocument();
  });

  it('Input — has no axe violations', async () => {
    // Arrange
    const { container } = render(
      <Input label="Question" helper="Keep it short." value="" onChange={() => {}} />,
    );

    // Act
    const results = await axe(container);

    // Assert
    expect(results).toHaveNoViolations();
  });
});
