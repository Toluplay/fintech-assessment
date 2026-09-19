import { createBrowserRouter, Navigate, Outlet } from 'react-router-dom';
import { Toaster } from '@/components/ui/Toaster';
import { useSessionBootstrap } from '@/hooks/useSessionBootstrap';
import { AppShell } from '@/layouts/AppShell';
import { AuthLayout } from '@/layouts/AuthLayout';
import { RedirectIfAuthenticated, RequireAuth } from './guards';
import { RouteErrorPage } from './RouteErrorPage';

/**
 * Every page is a separate chunk (`lazy`). Visiting /savings downloads the
 * shell + the savings page only; the loans and profile code is fetched when
 * (and if) the customer navigates there.
 */
const page = (loader: () => Promise<{ default: React.ComponentType }>) => async () => {
  const module = await loader();
  return { Component: module.default };
};

function Root() {
  useSessionBootstrap();
  return (
    <>
      <Outlet />
      <Toaster />
    </>
  );
}

export const routes = [
  {
    element: <Root />,
    errorElement: <RouteErrorPage />,
    children: [
      { index: true, element: <Navigate to="/dashboard" replace /> },
      {
        element: <RedirectIfAuthenticated />,
        children: [
          {
            element: <AuthLayout />,
            children: [
              { path: 'login', lazy: page(() => import('@/pages/LoginPage')) },
              { path: 'forgot-password', lazy: page(() => import('@/pages/ComingSoonPage')) },
              { path: 'register', lazy: page(() => import('@/pages/ComingSoonPage')) },
            ],
          },
        ],
      },
      {
        element: <RequireAuth />,
        children: [
          {
            element: <AppShell />,
            children: [
              { path: 'dashboard', lazy: page(() => import('@/pages/DashboardPage')) },
              { path: 'savings', lazy: page(() => import('@/pages/SavingsProductsPage')) },
              { path: 'savings/:id', lazy: page(() => import('@/pages/SavingsProductDetailPage')) },
              { path: 'loans', lazy: page(() => import('@/pages/LoanProductsPage')) },
              { path: 'loans/:id', lazy: page(() => import('@/pages/LoanProductDetailPage')) },
              { path: 'profile', lazy: page(() => import('@/pages/ProfilePage')) },
              { path: '*', lazy: page(() => import('@/pages/NotFoundPage')) },
            ],
          },
        ],
      },
    ],
  },
];

export const router = createBrowserRouter(routes);
