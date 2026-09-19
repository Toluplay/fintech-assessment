import { QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';
import { RouterProvider } from 'react-router-dom';
import { createQueryClient } from '@/hooks/queryClient';
import { router } from '@/routes/router';

export default function App() {
  // One client per app instance (not per render) so the cache survives re-renders.
  const [queryClient] = useState(createQueryClient);
  return (
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  );
}
