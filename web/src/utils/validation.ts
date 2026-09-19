export interface LoginFormValues {
  identifier: string;
  password: string;
}

export type LoginFormErrors = Partial<Record<keyof LoginFormValues, string>>;

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
/** Local (0801 234 5678) or international (+234 801 234 5678) phone numbers. */
const PHONE_PATTERN = /^\+?\d{10,15}$/;

export const PASSWORD_MIN_LENGTH = 8;

export function validateIdentifier(value: string): string | undefined {
  const trimmed = value.trim();
  if (!trimmed) return 'Enter your email address or phone number';
  if (trimmed.includes('@')) {
    return EMAIL_PATTERN.test(trimmed) ? undefined : 'Enter a valid email address';
  }
  const digits = trimmed.replace(/[\s-]/g, '');
  return PHONE_PATTERN.test(digits) ? undefined : 'Enter a valid phone number or email address';
}

export function validatePassword(value: string): string | undefined {
  if (!value) return 'Enter your password';
  if (value.length < PASSWORD_MIN_LENGTH) {
    return `Password must be at least ${PASSWORD_MIN_LENGTH} characters`;
  }
  return undefined;
}

export function validateLogin(values: LoginFormValues): LoginFormErrors {
  const errors: LoginFormErrors = {};
  const identifier = validateIdentifier(values.identifier);
  const password = validatePassword(values.password);
  if (identifier) errors.identifier = identifier;
  if (password) errors.password = password;
  return errors;
}

export function hasErrors(errors: LoginFormErrors): boolean {
  return Object.values(errors).some(Boolean);
}
