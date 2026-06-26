import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Badge } from './index';

describe('Badge', () => {
  it('Badge — live variant — renders the Open label text', () => {
    // Arrange / Act
    render(<Badge variant="live">Open</Badge>);

    // Assert — colour is never the only signal; the label carries meaning.
    expect(screen.getByText('Open')).toBeInTheDocument();
  });

  it('Badge — archived variant — renders the Closed label text', () => {
    // Arrange / Act
    render(<Badge variant="archived">Closed</Badge>);

    // Assert
    expect(screen.getByText('Closed')).toBeInTheDocument();
  });
});
