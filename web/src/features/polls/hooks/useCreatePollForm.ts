import { useReducer } from 'react';
import { MIN_OPTIONS, MAX_OPTIONS } from '@/lib/constants';

export interface CreatePollFormState {
  question: string;
  options: string[];
  questionTouched: boolean;
  optionsTouched: boolean[];
  submitted: boolean;
}

export type CreatePollFormAction =
  | { type: 'SET_QUESTION'; value: string }
  | { type: 'BLUR_QUESTION' }
  | { type: 'SET_OPTION'; index: number; value: string }
  | { type: 'BLUR_OPTION'; index: number }
  | { type: 'ADD_OPTION' }
  | { type: 'REMOVE_OPTION'; index: number }
  | { type: 'MARK_SUBMITTED' };

export const initialCreatePollFormState: CreatePollFormState = {
  question: '',
  options: ['', ''],
  questionTouched: false,
  optionsTouched: [false, false],
  submitted: false,
};

function reducer(state: CreatePollFormState, action: CreatePollFormAction): CreatePollFormState {
  switch (action.type) {
    case 'SET_QUESTION':
      return { ...state, question: action.value };
    case 'BLUR_QUESTION':
      return { ...state, questionTouched: true };
    case 'SET_OPTION': {
      const options = state.options.slice();
      options[action.index] = action.value;
      return { ...state, options };
    }
    case 'BLUR_OPTION': {
      const optionsTouched = state.optionsTouched.slice();
      optionsTouched[action.index] = true;
      return { ...state, optionsTouched };
    }
    case 'ADD_OPTION':
      if (state.options.length >= MAX_OPTIONS) {
        return state;
      }
      return {
        ...state,
        options: state.options.concat(['']),
        optionsTouched: state.optionsTouched.concat([false]),
      };
    case 'REMOVE_OPTION': {
      if (state.options.length <= MIN_OPTIONS) {
        return state;
      }
      const options = state.options.slice();
      options.splice(action.index, 1);
      const optionsTouched = state.optionsTouched.slice();
      optionsTouched.splice(action.index, 1);
      return { ...state, options, optionsTouched };
    }
    case 'MARK_SUBMITTED':
      return {
        ...state,
        submitted: true,
        questionTouched: true,
        optionsTouched: state.options.map(() => true),
      };
  }
}

export function useCreatePollForm() {
  const [state, dispatch] = useReducer(reducer, initialCreatePollFormState);
  return { state, dispatch };
}
