import { type ButtonHTMLAttributes, type ReactNode } from 'react';
import { CircleNotch, type Icon } from '@phosphor-icons/react';
import styles from './Button.module.css';

type Variant = 'primary' | 'secondary' | 'destructive';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  /** Leading Phosphor icon component (regular weight). */
  icon?: Icon;
  /** Replaces the label with a spinner while preserving dimensions. */
  loading?: boolean;
  children: ReactNode;
}

const variantClass: Record<Variant, string> = {
  primary: styles.primary,
  secondary: styles.secondary,
  destructive: styles.destructive,
};

/** MWS button — never wraps its label; six universal states. */
export function Button({
  variant = 'primary',
  icon: IconComponent,
  loading = false,
  children,
  className,
  disabled,
  type = 'button',
  ...rest
}: ButtonProps) {
  return (
    <button
      type={type}
      className={`${styles.btn} ${variantClass[variant]} ${className ?? ''}`}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...rest}
    >
      {loading ? (
        <CircleNotch className={styles.spinner} size={18} aria-hidden="true" />
      ) : (
        IconComponent && <IconComponent size={18} weight="regular" aria-hidden="true" />
      )}
      <span>{children}</span>
    </button>
  );
}
