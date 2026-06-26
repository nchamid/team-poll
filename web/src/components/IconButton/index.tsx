import { type ButtonHTMLAttributes } from 'react';
import { type Icon } from '@phosphor-icons/react';
import styles from './IconButton.module.css';

interface IconButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'aria-label'> {
  icon: Icon;
  /** Required accessible name — icon-only buttons must always have one. */
  label: string;
  size?: number;
}

/** Icon-only button with a mandatory accessible name and a square hit area. */
export function IconButton({
  icon: IconComponent,
  label,
  size = 20,
  className,
  type = 'button',
  ...rest
}: IconButtonProps) {
  return (
    <button
      type={type}
      aria-label={label}
      title={label}
      className={`${styles.iconButton} ${className ?? ''}`}
      {...rest}
    >
      <IconComponent size={size} weight="regular" aria-hidden="true" />
    </button>
  );
}
