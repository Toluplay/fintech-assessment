import { useId, useRef, useState, type FormEvent } from 'react';
import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import { PasswordField, TextField } from '@/components/ui/TextField';
import type { LoginRequest } from '@/types/auth';
import { getUserMessage, isApiError } from '@/utils/errors';
import {
  hasErrors,
  validateIdentifier,
  validateLogin,
  validatePassword,
  type LoginFormErrors,
  type LoginFormValues,
} from '@/utils/validation';
import styles from './LoginForm.module.css';

interface LoginFormProps {
  onSubmit: (credentials: LoginRequest) => Promise<unknown>;
}

const INITIAL_VALUES: LoginFormValues = { identifier: '', password: '' };

/**
 * Controlled form with field-level validation on blur and full validation on
 * submit. The API error (wrong password, rate limit, offline...) is shown in a
 * live region above the fields, never as a raw transport error.
 */
export function LoginForm({ onSubmit }: LoginFormProps) {
  const [values, setValues] = useState<LoginFormValues>(INITIAL_VALUES);
  const [errors, setErrors] = useState<LoginFormErrors>({});
  const [touched, setTouched] = useState<Partial<Record<keyof LoginFormValues, boolean>>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const formErrorId = useId();
  const identifierRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);

  const update = (field: keyof LoginFormValues) => (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setValues((prev) => ({ ...prev, [field]: value }));
    // Re-validate live once the field has been touched so errors clear promptly.
    if (touched[field]) {
      const validate = field === 'identifier' ? validateIdentifier : validatePassword;
      setErrors((prev) => ({ ...prev, [field]: validate(value) }));
    }
    if (formError) setFormError(null);
  };

  const blur = (field: keyof LoginFormValues) => () => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    const validate = field === 'identifier' ? validateIdentifier : validatePassword;
    setErrors((prev) => ({ ...prev, [field]: validate(values[field]) }));
  };

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextErrors = validateLogin(values);
    setErrors(nextErrors);
    setTouched({ identifier: true, password: true });
    if (hasErrors(nextErrors)) {
      (nextErrors.identifier ? identifierRef : passwordRef).current?.focus();
      return;
    }

    setSubmitting(true);
    setFormError(null);
    try {
      await onSubmit({ identifier: values.identifier.trim(), password: values.password });
    } catch (error) {
      setFormError(getUserMessage(error));
      // Do not keep the password around after a failed attempt.
      if (isApiError(error) && error.kind === 'unauthorized') {
        setValues((prev) => ({ ...prev, password: '' }));
        passwordRef.current?.focus();
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit} noValidate aria-describedby={formError ? formErrorId : undefined}>
      {formError ? (
        <div id={formErrorId} className={styles.formError} role="alert">
          <Icon name="alert" size={18} />
          <span>{formError}</span>
        </div>
      ) : null}

      <TextField
        ref={identifierRef}
        label="Email or phone number"
        name="identifier"
        type="text"
        inputMode="email"
        autoComplete="username"
        autoCapitalize="none"
        placeholder="you@example.com or 0801 234 5678"
        value={values.identifier}
        onChange={update('identifier')}
        onBlur={blur('identifier')}
        error={touched.identifier ? errors.identifier : undefined}
        disabled={submitting}
        required
      />

      <PasswordField
        ref={passwordRef}
        label="Password"
        name="password"
        placeholder="Enter your password"
        value={values.password}
        onChange={update('password')}
        onBlur={blur('password')}
        error={touched.password ? errors.password : undefined}
        disabled={submitting}
        required
      />

      <Button type="submit" size="lg" fullWidth loading={submitting} loadingText="Signing in…">
        Log in
      </Button>
    </form>
  );
}
