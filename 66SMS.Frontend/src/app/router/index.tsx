import { createBrowserRouter, Navigate } from 'react-router-dom';
import { HomePage } from '@/pages/home/HomePage';
import { LoginPage } from '@/pages/auth/LoginPage';
import { UsersPage } from '@/pages/users/UsersPage';
import { ProtectedRoute } from './ProtectedRoute';
import { AdminLayout, AdminDashboard } from '@/features/admin';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <HomePage />,
  },
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    element: <ProtectedRoute />,
    children: [
      {
        path: '/dashboard',
        element: <div className="p-6">Dashboard</div>,
      },
      {
        path: '/users',
        element: <UsersPage />,
      },
    ],
  },
  {
    path: '/admin',
    element: <AdminLayout />,
    children: [
      {
        index: true,
        element: <AdminDashboard />,
      },
      // Placeholders for other admin routes
    ],
  },
  {
    path: '*',
    element: <Navigate to="/" replace />,
  },
]);