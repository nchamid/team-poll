import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useCreatePollForm } from './useCreatePollForm';

describe('useCreatePollForm', () => {
  it('useCreatePollForm — initial state — two empty options, untouched', () => {
    // Arrange / Act
    const { result } = renderHook(() => useCreatePollForm());

    // Assert
    expect(result.current.state.options).toEqual(['', '']);
    expect(result.current.state.submitted).toBe(false);
  });

  it('useCreatePollForm — SET_QUESTION — updates the question', () => {
    // Arrange
    const { result } = renderHook(() => useCreatePollForm());

    // Act
    act(() => result.current.dispatch({ type: 'SET_QUESTION', value: 'Pick a day' }));

    // Assert
    expect(result.current.state.question).toBe('Pick a day');
  });

  it('useCreatePollForm — ADD_OPTION — appends an option up to six', () => {
    // Arrange
    const { result } = renderHook(() => useCreatePollForm());

    // Act — add four to reach six total.
    act(() => {
      result.current.dispatch({ type: 'ADD_OPTION' });
      result.current.dispatch({ type: 'ADD_OPTION' });
      result.current.dispatch({ type: 'ADD_OPTION' });
      result.current.dispatch({ type: 'ADD_OPTION' });
    });

    // Assert — capped at six even though five were requested.
    expect(result.current.state.options).toHaveLength(6);
  });

  it('useCreatePollForm — ADD_OPTION at six — does not exceed the max', () => {
    // Arrange
    const { result } = renderHook(() => useCreatePollForm());
    act(() => {
      for (let count = 0; count < 4; count += 1) {
        result.current.dispatch({ type: 'ADD_OPTION' });
      }
    });

    // Act — a seventh add is a no-op.
    act(() => result.current.dispatch({ type: 'ADD_OPTION' }));

    // Assert
    expect(result.current.state.options).toHaveLength(6);
  });

  it('useCreatePollForm — REMOVE_OPTION — drops the option by index', () => {
    // Arrange
    const { result } = renderHook(() => useCreatePollForm());
    act(() => {
      result.current.dispatch({ type: 'ADD_OPTION' });
      result.current.dispatch({ type: 'SET_OPTION', index: 0, value: 'A' });
      result.current.dispatch({ type: 'SET_OPTION', index: 1, value: 'B' });
      result.current.dispatch({ type: 'SET_OPTION', index: 2, value: 'C' });
    });

    // Act
    act(() => result.current.dispatch({ type: 'REMOVE_OPTION', index: 1 }));

    // Assert
    expect(result.current.state.options).toEqual(['A', 'C']);
  });

  it('useCreatePollForm — REMOVE_OPTION at two — does not drop below the min', () => {
    // Arrange
    const { result } = renderHook(() => useCreatePollForm());

    // Act
    act(() => result.current.dispatch({ type: 'REMOVE_OPTION', index: 0 }));

    // Assert
    expect(result.current.state.options).toHaveLength(2);
  });

  it('useCreatePollForm — MARK_SUBMITTED — marks every field touched', () => {
    // Arrange
    const { result } = renderHook(() => useCreatePollForm());

    // Act
    act(() => result.current.dispatch({ type: 'MARK_SUBMITTED' }));

    // Assert
    expect(result.current.state.submitted).toBe(true);
    expect(result.current.state.questionTouched).toBe(true);
    expect(result.current.state.optionsTouched).toEqual([true, true]);
  });

  it('useCreatePollForm — BLUR_OPTION — marks only that option touched', () => {
    // Arrange
    const { result } = renderHook(() => useCreatePollForm());

    // Act
    act(() => result.current.dispatch({ type: 'BLUR_OPTION', index: 1 }));

    // Assert
    expect(result.current.state.optionsTouched).toEqual([false, true]);
  });
});
