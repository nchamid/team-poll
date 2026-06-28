import { describe, it, expect } from 'vitest';
import { buildSeedPolls, DEMO_USER_DISPLAY_NAME } from './seedData';

describe('buildSeedPolls', () => {
  it('buildSeedPolls — seed set — returns five polls with unique ids', () => {
    // Arrange + Act
    const polls = buildSeedPolls();

    // Assert
    expect(polls).toHaveLength(5);
    const ids = polls.map((poll) => poll.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('buildSeedPolls — every poll — has at least two options with unique ids', () => {
    // Arrange + Act
    const polls = buildSeedPolls();

    // Assert
    for (const poll of polls) {
      expect(poll.options.length).toBeGreaterThanOrEqual(2);
      const optionIds = poll.options.map((option) => option.id);
      expect(new Set(optionIds).size).toBe(optionIds.length);
    }
  });

  it('buildSeedPolls — called twice — returns independent arrays (mutating one leaves the other clean)', () => {
    // Arrange
    const first = buildSeedPolls();

    // Act
    first[0].options[0].voteCount = 999;
    const second = buildSeedPolls();

    // Assert
    expect(second[0].options[0].voteCount).not.toBe(999);
  });

  it('DEMO_USER_DISPLAY_NAME — visitor label — reads as "You"', () => {
    // Assert
    expect(DEMO_USER_DISPLAY_NAME).toBe('You');
  });
});
