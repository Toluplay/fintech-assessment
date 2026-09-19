import { describe, expect, it } from 'vitest';
import { validateIdentifier, validateLogin, validatePassword } from './validation';

describe('login validation', () => {
  it('requires an identifier', () => {
    expect(validateIdentifier('')).toBe('Enter your email address or phone number');
    expect(validateIdentifier('   ')).toBe('Enter your email address or phone number');
  });

  it('validates email format when an @ is present', () => {
    expect(validateIdentifier('john@example.com')).toBeUndefined();
    expect(validateIdentifier('john@')).toBe('Enter a valid email address');
    expect(validateIdentifier('john@example')).toBe('Enter a valid email address');
  });

  it('accepts local and international phone numbers', () => {
    expect(validateIdentifier('08012345678')).toBeUndefined();
    expect(validateIdentifier('0801 234 5678')).toBeUndefined();
    expect(validateIdentifier('+2348012345678')).toBeUndefined();
    expect(validateIdentifier('1234')).toBe('Enter a valid phone number or email address');
  });

  it('enforces the password minimum length', () => {
    expect(validatePassword('')).toBe('Enter your password');
    expect(validatePassword('short')).toBe('Password must be at least 8 characters');
    expect(validatePassword('longenough')).toBeUndefined();
  });

  it('aggregates field errors', () => {
    expect(validateLogin({ identifier: '', password: '' })).toEqual({
      identifier: 'Enter your email address or phone number',
      password: 'Enter your password',
    });
    expect(validateLogin({ identifier: 'john@example.com', password: 'Password123!' })).toEqual({});
  });
});
