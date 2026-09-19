import { screen, waitFor, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { failWith } from '@/test/handlers';
import { server } from '@/test/server';
import { renderWithProviders, signIn } from '@/test/test-utils';
import SavingsProductsPage from './SavingsProductsPage';

describe('<SavingsProductsPage />', () => {
  it('shows skeletons while loading, then renders every product card', async () => {
    signIn();
    renderWithProviders(<SavingsProductsPage />, { route: '/savings' });

    // Skeleton grid with an accessible loading message, no generic spinner.
    expect(screen.getByTestId('product-grid-skeleton')).toBeInTheDocument();
    expect(screen.getByText('Loading savings products…')).toBeInTheDocument();

    const list = await screen.findByRole('list', { name: 'Savings products' });
    const cards = within(list).getAllByTestId('product-card');
    expect(cards).toHaveLength(3);
    expect(screen.queryByTestId('product-grid-skeleton')).not.toBeInTheDocument();

    const target = cards[0];
    expect(within(target).getByRole('heading', { name: 'Target Savings' })).toBeInTheDocument();
    expect(within(target).getByText('12% p.a.')).toBeInTheDocument();
    expect(within(target).getByText('₦5,000')).toBeInTheDocument();
    expect(within(target).getByText('12 months')).toBeInTheDocument();
    expect(within(target).getByText('Save towards a specific financial goal.')).toBeInTheDocument();
    expect(within(target).getByRole('link', { name: /view details for target savings/i })).toHaveAttribute(
      'href',
      '/savings/1',
    );

    // The best rate is called out.
    expect(within(cards[2]).getByText('Best rate')).toBeInTheDocument();
  });

  it('shows a friendly error with a retry action when the API fails', async () => {
    signIn();
    server.use(failWith('get', '/savings-products', 500));
    const { user } = renderWithProviders(<SavingsProductsPage />, { route: '/savings' });

    const alert = await screen.findByRole('alert');
    expect(alert).toHaveTextContent('Unable to load savings products.');
    expect(alert).toHaveTextContent('Something went wrong on our side. Please try again.');
    expect(alert).not.toHaveTextContent(/500|AxiosError|status code/i);

    // Recover: the API comes back and retry re-fetches.
    server.resetHandlers();
    await user.click(screen.getByRole('button', { name: /try again/i }));
    await waitFor(() =>
      expect(screen.getByRole('list', { name: 'Savings products' })).toBeInTheDocument(),
    );
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });
});
