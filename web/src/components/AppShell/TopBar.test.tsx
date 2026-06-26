import { describe, it, expect, vi } from 'vitest';
import { screen } from '@testing-library/react';
import { axe } from 'vitest-axe';
import { renderWithProviders } from '@/test-utils';
import { TopBar } from './TopBar';

// Mock at the auth boundary so the bar renders without an MSAL provider.
vi.mock('@/auth/useAccount', () => ({
  useAccount: () => ({
    account: null,
    user: { displayName: 'Ada Lovelace', username: 'ada@example.com' },
    signIn: vi.fn(),
    signOut: vi.fn(),
  }),
}));

describe('TopBar', () => {
  it('TopBar — ESPN link — accessible name is ESPN and opens the destination in a new tab safely', () => {
    // Arrange
    renderWithProviders(<TopBar breadcrumbLeaf={null} onOpenDrawer={vi.fn()} />);

    // Act
    const sut = screen.getByRole('link', { name: 'ESPN' });

    // Assert
    expect(sut).toHaveAccessibleName('ESPN');
    expect(sut).toHaveAttribute('href', 'https://espn.com');
    expect(sut).toHaveAttribute('target', '_blank');
    expect(sut).toHaveAttribute('rel', 'noopener noreferrer');
  });

  it('TopBar — rendered with a breadcrumb leaf — has no axe violations', async () => {
    // Arrange
    const { container } = renderWithProviders(
      <TopBar breadcrumbLeaf="Sprint planning" onOpenDrawer={vi.fn()} />,
    );

    // Act
    const results = await axe(container);

    // Assert
    expect(results).toHaveNoViolations();
  });
});
