import { createBrowserRouter, Navigate } from 'react-router-dom';
import { HomePage } from '@/features/landing/pages/HomePage';
import { LoginPage } from '@/features/auth/pages/LoginPage';
import { UsersPage } from '@/features/users/pages/UsersPage';
import { ProtectedRoute } from './ProtectedRoute';
import { AdminLayout, AdminDashboard } from '@/features/admin';
import { EmployeeListPage } from '@/features/employees/pages/EmployeeListPage';
import { CustomerListPage } from '@/features/customers/pages/CustomerListPage';

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
      {
        path: '/admin',
        element: <AdminLayout />,
        children: [
          {
            index: true,
            element: <AdminDashboard />,
          },
          {
            path: 'staff/list',
            element: <EmployeeListPage />,
          },
          {
            path: 'customers/list',
            element: <CustomerListPage />,
          },
          // Placeholders for other admin routes
        ],
      },
    ],
  },
  {
    path: '*',
    element: <Navigate to="/" replace />,
  },
]);