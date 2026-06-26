import { memo, useCallback } from 'react';
import { X } from '@phosphor-icons/react';
import { Input } from '@/components/Input';
import { IconButton } from '@/components/IconButton';
import { OPTION_MAX_LENGTH } from '@/lib/constants';
import styles from './OptionRow.module.css';

interface OptionRowProps {
  index: number;
  value: string;
  error: string;
  canRemove: boolean;
  onChange: (index: number, value: string) => void;
  onBlur: (index: number) => void;
  onRemove: (index: number) => void;
}

/** A single create-poll option field with an optional remove control. */
function OptionRowComponent({
  index,
  value,
  error,
  canRemove,
  onChange,
  onBlur,
  onRemove,
}: OptionRowProps) {
  const handleChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => onChange(index, event.target.value),
    [index, onChange],
  );
  const handleBlur = useCallback(() => onBlur(index), [index, onBlur]);
  const handleRemove = useCallback(() => onRemove(index), [index, onRemove]);

  return (
    <div className={styles.row}>
      <div className={styles.field}>
        <Input
          ariaLabel={`Option ${index + 1}`}
          placeholder={`Option ${index + 1}`}
          value={value}
          error={error}
          maxLength={OPTION_MAX_LENGTH}
          onChange={handleChange}
          onBlur={handleBlur}
        />
      </div>
      {canRemove && (
        <div className={styles.removeWrap}>
          <IconButton icon={X} label={`Remove option ${index + 1}`} onClick={handleRemove} />
        </div>
      )}
    </div>
  );
}

export const OptionRow = memo(OptionRowComponent);
