import { useCallback, useMemo } from 'react';
import { ArrowLeft, Plus, Check } from '@phosphor-icons/react';
import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import { Alert } from '@/components/Alert';
import { ApiError } from '@/lib/apiClient';
import { QUESTION_MAX_LENGTH, MAX_OPTIONS } from '@/lib/constants';
import { useNavigation } from '@/store/navigation';
import { useCreatePoll } from '../../hooks/useCreatePoll';
import { useCreatePollForm } from '../../hooks/useCreatePollForm';
import { validateCreatePoll, optionCountLabel } from '../../utils';
import { OptionRow } from '../OptionRow';
import styles from './CreatePollPage.module.css';

/** S3 — Create poll. Question field + dynamic 2–6 option editor with validation. */
export function CreatePollPage() {
  const { goList } = useNavigation();
  const { state, dispatch } = useCreatePollForm();
  const createPoll = useCreatePoll();

  const validation = useMemo(
    () => validateCreatePoll({ question: state.question, options: state.options }),
    [state.question, state.options],
  );

  const setQuestion = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) =>
      dispatch({ type: 'SET_QUESTION', value: event.target.value }),
    [dispatch],
  );
  const setOption = useCallback(
    (index: number, value: string) => dispatch({ type: 'SET_OPTION', index, value }),
    [dispatch],
  );
  const blurOption = useCallback(
    (index: number) => dispatch({ type: 'BLUR_OPTION', index }),
    [dispatch],
  );
  const removeOption = useCallback(
    (index: number) => dispatch({ type: 'REMOVE_OPTION', index }),
    [dispatch],
  );

  const handleSubmit = useCallback(
    (event: React.FormEvent) => {
      event.preventDefault();
      if (!validation.ok) {
        dispatch({ type: 'MARK_SUBMITTED' });
        return;
      }
      createPoll.mutate(
        {
          question: state.question.trim(),
          options: state.options.map((option) => option.trim()),
        },
        { onSuccess: () => goList() },
      );
    },
    [validation.ok, createPoll, state.question, state.options, dispatch, goList],
  );

  const showValidationSummary = state.submitted && !validation.ok;
  const submitError = createPoll.error;
  const questionError = state.submitted || state.questionTouched ? validation.question : '';

  return (
    <div className={styles.page}>
      <button type="button" onClick={goList} className={styles.back}>
        <ArrowLeft size={16} weight="regular" aria-hidden="true" />
        <span>Back to polls</span>
      </button>
      <p className="eyebrow">Team Poll</p>
      <h1 className={`h2 ${styles.title}`}>Create a poll</h1>
      <p className={styles.lede}>
        Ask one question, add up to six options, and the team can start voting right away.
      </p>

      {showValidationSummary && (
        <div className={styles.alert}>
          <Alert severity="warning">
            A few fields need attention before this poll can go out. Check the highlighted items
            below.
          </Alert>
        </div>
      )}

      {submitError && (
        <div className={styles.alert}>
          <Alert severity="error">
            {submitError instanceof ApiError
              ? submitError.message
              : "We couldn't create this poll just now. Try again in a moment."}
          </Alert>
        </div>
      )}

      <form className={styles.form} onSubmit={handleSubmit} noValidate>
        <Input
          label="Question"
          placeholder="What should the team decide?"
          helper="Keep it short — this is what everyone sees."
          value={state.question}
          error={questionError}
          maxLength={QUESTION_MAX_LENGTH}
          showCount
          onChange={setQuestion}
          onBlur={() => dispatch({ type: 'BLUR_QUESTION' })}
        />

        <fieldset className={styles.options}>
          <legend className={styles.optionsLegend}>Options</legend>
          <p className={styles.optionsHint}>
            Add between two and six choices. People pick exactly one.
          </p>
          <div className={styles.optionList}>
            {state.options.map((value, index) => (
              <OptionRow
                key={index}
                index={index}
                value={value}
                error={
                  state.submitted || state.optionsTouched[index] ? validation.options[index] : ''
                }
                canRemove={state.options.length > 2}
                onChange={setOption}
                onBlur={blurOption}
                onRemove={removeOption}
              />
            ))}
          </div>
          <div className={styles.optionsFooter}>
            <Button
              variant="secondary"
              icon={Plus}
              onClick={() => dispatch({ type: 'ADD_OPTION' })}
              disabled={state.options.length >= MAX_OPTIONS}
            >
              Add option
            </Button>
            <span className={styles.counter}>{optionCountLabel(state.options.length)}</span>
          </div>
        </fieldset>

        <div className={styles.actions}>
          <Button type="submit" icon={Check} loading={createPoll.isPending}>
            Create poll
          </Button>
          <Button variant="secondary" onClick={goList}>
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}
