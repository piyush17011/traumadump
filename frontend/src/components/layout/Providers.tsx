'use client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { useEffect, useState } from 'react';
import { useAuthStore } from '../../store/authStore';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 1, staleTime: 1000 * 30 },
  },
});

export function Providers({ children }: { children: React.ReactNode }) {
  const initAuth = useAuthStore((s) => s.initAuth);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    initAuth();
    setMounted(true);
  }, [initAuth]);

  if (!mounted) return null;

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <Toaster
        position="bottom-right"
        toastOptions={{
          style: { borderRadius: '12px', fontFamily: 'Inter, sans-serif', fontSize: '14px' },
          success: { iconTheme: { primary: '#6366f1', secondary: '#fff' } },
        }}
      />
    </QueryClientProvider>
  );
}
