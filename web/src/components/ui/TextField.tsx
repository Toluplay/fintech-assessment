import { forwardRef, useId, useState, type InputHTMLAttributes, type ReactNode } from 'react';
import { Icon } from './Icon';
import styles from './TextField.module.css';

interface TextFieldProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'id'> {
  label: string;
  error?: string;
  hint?: string;
  trailing?: ReactNode;
}

/**
 * Accessible labelled input: the label is a real <label>, errors are linked
 * through aria-describedby and announced via role="alert".
 */
export const TextField = forwardRef<HTMLInputElement, TextFieldProps>(function TextField(
  { label, error, hint, trailing, className, ...rest },
  ref,
) {
  const id = useId();
  const errorId = `${id}-error`;
  const hintId = `${id}-hint`;
  const describedBy = [error ? errorId : null, hint ? hintId : null].filter(Boolean).join(' ');

  return (
    <div className={`${styles.field} ${className ?? ''}`}>
      <label htmlFor={id} className={styles.label}>
        {label}
      </label>
      <div className={`${styles.control} ${error ? styles.invalid : ''}`}>
        <input
          ref={ref}
          id={id}
          className={styles.input}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy || undefined}
          {...rest}
        />
        {trailing ? <div className={styles.trailing}>{trailing}</div> : null}
      </div>
      {hint && !error ? (
        <p id={hintId} className={styles.hint}>
          {hint}
        </p>
      ) : null}
      {error ? (
        <p id={errorId} className={styles.error} role="alert">
          <Icon name="alert" size={16} />
          {error}
        </p>
      ) : null}
    </div>
  );
});

type PasswordFieldProps = Omit<TextFieldProps, 'type' | 'trailing'>;

/** Password input with a show/hide toggle that never changes the field's name. */
export const PasswordField = forwardRef<HTMLInputElement, PasswordFieldProps>(
  function PasswordField(props, ref) {
    const [visible, setVisible] = useState(false);
    return (
      <TextField
        ref={ref}
        type={visible ? 'text' : 'password'}
        autoComplete="current-password"
        spellCheck={false}
        trailing={
          <button
            type="button"
            className={styles.toggle}
            onClick={() => setVisible((v) => !v)}
            aria-label={visible ? 'Hide password' : 'Show password'}
            aria-pressed={visible}
          >
            <Icon name={visible ? 'eyeOff' : 'eye'} size={18} />
          </button>
        }
        {...props}
      />
    );
  },
);
