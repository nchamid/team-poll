import { describe, it, expect } from 'vitest';
import { validateCreatePoll, optionCountLabel, pollMeta, totalVotesLabel } from './utils';
import { QUESTION_MAX_LENGTH, OPTION_MAX_LENGTH } from '@/lib/constants';

describe('validateCreatePoll', () => {
  it('validateCreatePoll — valid question and two options — ok is true', () => {
    // Arrange
    const sut = { question: 'Pick a day', options: ['Mon', 'Tue'] };

    // Act
    const result = validateCreatePoll(sut);

    // Assert
    expect(result.ok).toBe(true);
    expect(result.question).toBe('');
    expect(result.options).toEqual(['', '']);
  });

  it('validateCreatePoll — empty question — flags a question error', () => {
    // Arrange
    const sut = { question: '   ', options: ['Mon', 'Tue'] };

    // Act
    const result = validateCreatePoll(sut);

    // Assert
    expect(result.ok).toBe(false);
    expect(result.question).toMatch(/add a question/i);
  });

  it('validateCreatePoll — question over 280 chars — flags length (not 140)', () => {
    // Arrange — 281 chars exceeds the 280 limit; a 200-char question is valid,
    // proving the bound is 280 and not the prototype's 140.
    const tooLong = 'a'.repeat(QUESTION_MAX_LENGTH + 1);
    const longButValid = 'b'.repeat(200);

    // Act
    const invalid = validateCreatePoll({ question: tooLong, options: ['Mon', 'Tue'] });
    const valid = validateCreatePoll({ question: longButValid, options: ['Mon', 'Tue'] });

    // Assert
    expect(invalid.ok).toBe(false);
    expect(invalid.question).toMatch(/under 280 characters/);
    expect(valid.ok).toBe(true);
  });

  it('validateCreatePoll — blank option — flags that option only', () => {
    // Arrange
    const sut = { question: 'Pick a day', options: ['Mon', ''] };

    // Act
    const result = validateCreatePoll(sut);

    // Assert
    expect(result.ok).toBe(false);
    expect(result.options[0]).toBe('');
    expect(result.options[1]).toMatch(/add a label/i);
  });

  it('validateCreatePoll — option over 80 chars — flags option length', () => {
    // Arrange
    const sut = { question: 'Pick a day', options: ['Mon', 'x'.repeat(OPTION_MAX_LENGTH + 1)] };

    // Act
    const result = validateCreatePoll(sut);

    // Assert
    expect(result.ok).toBe(false);
    expect(result.options[1]).toMatch(/under 80 characters/);
  });
});

describe('label helpers', () => {
  it('optionCountLabel — three options — reads N of 6 options', () => {
    // Arrange / Act
    const sut = optionCountLabel(3);

    // Assert
    expect(sut).toBe('3 of 6 options');
  });

  it('pollMeta — singular counts — uses singular nouns', () => {
    // Arrange / Act
    const sut = pollMeta(1, 1);

    // Assert
    expect(sut).toBe('1 option · 1 vote');
  });

  it('totalVotesLabel — zero votes — reads No votes yet', () => {
    // Arrange / Act
    const sut = totalVotesLabel(0);

    // Assert
    expect(sut).toBe('No votes yet');
  });

  it('totalVotesLabel — many votes — pluralizes', () => {
    // Arrange / Act
    const sut = totalVotesLabel(12);

    // Assert
    expect(sut).toBe('12 votes total');
  });
});
