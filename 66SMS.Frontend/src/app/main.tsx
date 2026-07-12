import React from 'react';
import ReactDOM from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';
import { Toaster } from '@/shared/components/ui/sonner';
import { QueryProvider } from '@/app/providers/QueryProvider';
import { AuthBootstrap } from '@/features/auth/components/AuthBootstrap';
import { router } from '@/app/router';
import '@/styles/index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryProvider>
      <AuthBootstrap>
        <RouterProvider router={router} />
        <Toaster position="top-right" />
      </AuthBootstrap>
    </QueryProvider>
  </React.StrictMode>,
);
