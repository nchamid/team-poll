import { type InputHTMLAttributes, useId } from 'react';
import { WarningCircle } from '@phosphor-icons/react';
import styles from './Input.module.css';

interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'id'> {
  /** Visible label. When omitted, `ariaLabel` must be supplied instead. */
  label?: string;
  ariaLabel?: string;
  helper?: string;
  error?: string;
  /** Show a live character counter (uses maxLength). */
  showCount?: boolean;
}

/**
 * MWS text input. Label always visible (never placeholder-as-label); helper
 * sits above the field and is replaced by the error message on error. Error
 * text is navy with a leading warning icon — never error-red text.
 */
export function Input({
  label,
  ariaLabel,
  helper,
  error,
  showCount = false,
  maxLength,
  value,
  className,
  ...rest
}: InputProps) {
  const id = useId();
  const helperId = `${id}-helper`;
  const errorId = `${id}-error`;
  const hasError = Boolean(error);
  const describedBy = hasError ? errorId : helper ? helperId : undefined;
  const currentLength = typeof value === 'string' ? value.length : 0;

  return (
    <div className={styles.field}>
      {label && (
        <label htmlFor={id} className={styles.label}>
          {label}
        </label>
      )}
      {helper && !hasError && (
        <p id={helperId} className={styles.helper}>
          {helper}
        </p>
      )}
      <input
        id={id}
        className={`${styles.input} ${hasError ? styles.inputError : ''} ${className ?? ''}`}
        aria-label={!label ? ariaLabel : undefined}
        aria-invalid={hasError || undefined}
        aria-describedby={describedBy}
        maxLength={maxLength}
        value={value}
        {...rest}
      />
      <div className={styles.footer}>
        {hasError ? (
          <p id={errorId} className={styles.error}>
            <WarningCircle size={16} weight="regular" aria-hidden="true" />
            <span>{error}</span>
          </p>
        ) : (
          <span />
        )}
        {showCount && maxLength != null && (
          <span className={styles.count}>
            {currentLength}/{maxLength}
          </span>
        )}
      </div>
    </div>
  );
}
