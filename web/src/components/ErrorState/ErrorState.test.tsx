import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ErrorState } from './index';
import { ApiError } from '@/lib/apiClient';

describe('ErrorState', () => {
  it('ErrorState — 403 — explains the access denial (never 404 wording)', () => {
    // Arrange / Act
    render(<ErrorState error={new ApiError(403, null, 'forbidden')} />);

    // Assert
    expect(screen.getByText("You don't have access to this poll")).toBeInTheDocument();
  });

  it('ErrorState — 404 — says the poll is no longer available', () => {
    // Arrange / Act
    render(<ErrorState error={new ApiError(404, null, 'not found')} />);

    // Assert
    expect(screen.getByText('This poll is no longer available')).toBeInTheDocument();
  });

  it('ErrorState — generic error — shows the fallback recovery copy', () => {
    // Arrange / Act
    render(<ErrorState error={new Error('boom')} />);

    // Assert
    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
  });
});
