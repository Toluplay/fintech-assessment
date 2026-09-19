import { screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { renderWithProviders } from '@/test/test-utils';
import { ApiError } from '@/utils/errors';
import { LoginForm } from './LoginForm';

describe('<LoginForm />', () => {
  it('shows required-field errors and does not submit an empty form', async () => {
    const onSubmit = vi.fn();
    const { user } = renderWithProviders(<LoginForm onSubmit={onSubmit} />);

    await user.click(screen.getByRole('button', { name: /log in/i }));

    expect(await screen.findByText('Enter your email address or phone number')).toBeInTheDocument();
    expect(screen.getByText('Enter your password')).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
    // Focus moves to the first invalid field for keyboard/screen-reader users.
    expect(screen.getByLabelText(/email or phone number/i)).toHaveFocus();
  });

  it('validates email format and password length on blur', async () => {
    const { user } = renderWithProviders(<LoginForm onSubmit={vi.fn()} />);

    const identifier = screen.getByLabelText(/email or phone number/i);
    await user.type(identifier, 'not-an-email@');
    await user.tab();
    expect(await screen.findByText('Enter a valid email address')).toBeInTheDocument();
    expect(identifier).toHaveAttribute('aria-invalid', 'true');

    const password = screen.getByLabelText(/^password$/i);
    await user.type(password, 'short');
    await user.tab();
    expect(await screen.findByText('Password must be at least 8 characters')).toBeInTheDocument();

    // Fixing the value clears the message.
    await user.clear(identifier);
    await user.type(identifier, 'john@example.com');
    await waitFor(() => expect(screen.queryByText('Enter a valid email address')).not.toBeInTheDocument());
  });

  it('toggles password visibility without changing the value', async () => {
    const { user } = renderWithProviders(<LoginForm onSubmit={vi.fn()} />);
    const password = screen.getByLabelText(/^password$/i);
    await user.type(password, 'Password123!');
    expect(password).toHaveAttribute('type', 'password');

    await user.click(screen.getByRole('button', { name: /show password/i }));
    expect(password).toHaveAttribute('type', 'text');
    expect(password).toHaveValue('Password123!');

    await user.click(screen.getByRole('button', { name: /hide password/i }));
    expect(password).toHaveAttribute('type', 'password');
  });

  it('submits trimmed credentials and shows a loading state', async () => {
    let resolveSubmit: () => void = () => {};
    const onSubmit = vi.fn(() => new Promise<void>((resolve) => (resolveSubmit = resolve)));
    const { user } = renderWithProviders(<LoginForm onSubmit={onSubmit} />);

    await user.type(screen.getByLabelText(/email or phone number/i), '  john@example.com ');
    await user.type(screen.getByLabelText(/^password$/i), 'Password123!');
    await user.click(screen.getByRole('button', { name: /log in/i }));

    expect(onSubmit).toHaveBeenCalledWith({ identifier: 'john@example.com', password: 'Password123!' });
    const button = screen.getByRole('button', { name: /signing in/i });
    expect(button).toBeDisabled();
    expect(button).toHaveAttribute('aria-busy', 'true');
    expect(screen.getByLabelText(/email or phone number/i)).toBeDisabled();

    resolveSubmit();
    await waitFor(() => expect(screen.getByRole('button', { name: /log in/i })).toBeEnabled());
  });

  it('surfaces a friendly API error and clears the password on a failed login', async () => {
    const onSubmit = vi
      .fn()
      .mockRejectedValue(new ApiError(401, 'Incorrect email/phone number or password'));
    const { user } = renderWithProviders(<LoginForm onSubmit={onSubmit} />);

    await user.type(screen.getByLabelText(/email or phone number/i), 'john@example.com');
    await user.type(screen.getByLabelText(/^password$/i), 'WrongPassword1');
    await user.click(screen.getByRole('button', { name: /log in/i }));

    const alert = await screen.findByRole('alert');
    expect(alert).toHaveTextContent('Incorrect email/phone number or password');
    expect(screen.getByLabelText(/^password$/i)).toHaveValue('');
    expect(screen.getByLabelText(/^password$/i)).toHaveFocus();
  });

  it('never shows raw transport errors', async () => {
    const onSubmit = vi.fn().mockRejectedValue(new TypeError('Failed to fetch'));
    const { user } = renderWithProviders(<LoginForm onSubmit={onSubmit} />);

    await user.type(screen.getByLabelText(/email or phone number/i), 'john@example.com');
    await user.type(screen.getByLabelText(/^password$/i), 'Password123!');
    await user.click(screen.getByRole('button', { name: /log in/i }));

    const alert = await screen.findByRole('alert');
    expect(alert).not.toHaveTextContent(/failed to fetch/i);
    expect(alert).toHaveTextContent(/something unexpected happened/i);
  });
});
