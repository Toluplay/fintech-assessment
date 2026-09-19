import { Outlet } from 'react-router-dom';
import { Toaster } from '@/components/ui/Toaster';
import { useSessionBootstrap } from '@/hooks/useSessionBootstrap';

/** Top-level layout: restores the session on boot and hosts global toasts. */
export function Root() {
  useSessionBootstrap();
  return (
    <>
      <Outlet />
      <Toaster />
    </>
  );
}
