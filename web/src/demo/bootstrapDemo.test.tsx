import { describe, it, expect, beforeAll } from 'vitest';
import { render, screen } from '@testing-library/react';
import { axe } from 'vitest-axe';
import { PublicClientApplication, type IPublicClientApplication } from '@azure/msal-browser';
import { DemoRoot, demoMsalConfig } from './bootstrapDemo';

/** A real but offline MSAL instance — the demo never triggers a token request,
 * so initializing it makes no network call. Shared across the tests below. */
let instance: IPublicClientApplication;

beforeAll(async () => {
  instance = new PublicClientApplication(demoMsalConfig);
  await instance.initialize();
});

describe('DemoRoot', () => {
  it('DemoRoot — mounted — renders the seeded poll list against the mock API', async () => {
    // Arrange
    render(<DemoRoot instance={instance} />);

    // Act
    const heading = await screen.findByRole('heading', { name: 'Polls' });
    const seededPoll = await screen.findByText('Where should we grab lunch on Friday?');

    // Assert
    expect(heading).toBeInTheDocument();
    expect(seededPoll).toBeInTheDocument();
  });

  it('DemoRoot — mounted — shows the sample-data demo marker', async () => {
    // Arrange
    render(<DemoRoot instance={instance} />);

    // Act
    const marker = await screen.findByRole('note', { name: 'Demo build with sample data' });

    // Assert
    expect(marker).toBeInTheDocument();
  });

  it('DemoRoot — loaded list — has no axe violations', async () => {
    // Arrange
    const { container } = render(<DemoRoot instance={instance} />);
    await screen.findByText('Where should we grab lunch on Friday?');

    // Act
    const results = await axe(container);

    // Assert
    expect(results).toHaveNoViolations();
  });
});
