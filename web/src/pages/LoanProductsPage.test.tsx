import { screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { failWith, networkError } from '@/test/handlers';
import { server } from '@/test/server';
import { renderWithProviders, signIn } from '@/test/test-utils';
import LoanProductsPage from './LoanProductsPage';

describe('<LoanProductsPage />', () => {
  it('renders loan cards with range, tenure and interest', async () => {
    signIn();
    renderWithProviders(<LoanProductsPage />, { route: '/loans' });

    expect(screen.getByText('Loading loan products…')).toBeInTheDocument();

    const list = await screen.findByRole('list', { name: 'Loan products' });
    const cards = within(list).getAllByTestId('product-card');
    expect(cards).toHaveLength(3);

    const personal = cards[0];
    expect(within(personal).getByRole('heading', { name: 'Personal Loan' })).toBeInTheDocument();
    expect(within(personal).getByText('₦50K – ₦2M')).toBeInTheDocument();
    expect(within(personal).getByText('3-12 months')).toBeInTheDocument();
    expect(within(personal).getByText('5% monthly')).toBeInTheDocument();

    const business = cards[2];
    expect(within(business).getByText('Based on assessment')).toBeInTheDocument();
    expect(within(business).getByRole('link', { name: /view details for business loan/i })).toHaveAttribute(
      'href',
      '/loans/3',
    );
  });

  it('maps a 403 to a permission message', async () => {
    signIn();
    server.use(failWith('get', '/loan-products', 403));
    renderWithProviders(<LoanProductsPage />, { route: '/loans' });

    const alert = await screen.findByRole('alert');
    expect(alert).toHaveTextContent('You do not have permission to do that.');
    expect(screen.getByRole('button', { name: /try again/i })).toBeInTheDocument();
  });

  it('explains network failures in plain language', async () => {
    signIn();
    server.use(networkError('get', '/loan-products'));
    renderWithProviders(<LoanProductsPage />, { route: '/loans' });

    const alert = await screen.findByRole('alert');
    expect(alert).toHaveTextContent('You appear to be offline. Check your connection and try again.');
  });
});
