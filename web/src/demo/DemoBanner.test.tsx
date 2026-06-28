import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { axe } from 'vitest-axe';
import { DemoBanner } from './DemoBanner';

describe('DemoBanner', () => {
  it('DemoBanner — rendered — exposes an accessible note naming the demo build', () => {
    // Arrange
    render(<DemoBanner />);

    // Act
    const sut = screen.getByRole('note', { name: 'Demo build with sample data' });

    // Assert
    expect(sut).toBeInTheDocument();
    expect(sut).toHaveTextContent(/Demo/);
  });

  it('DemoBanner — rendered — has no axe violations', async () => {
    // Arrange
    const { container } = render(<DemoBanner />);

    // Act
    const results = await axe(container);

    // Assert
    expect(results).toHaveNoViolations();
  });
});
