import { Navigate, Outlet } from 'react-router-dom';
import { useEffect } from 'react';

import { useAuthStore } from '@/features/auth/stores/authStore';
import { useGetMe } from '@/features/users/hooks/useGetMe';

export const ProtectedRoute = () => {
  const accessToken = useAuthStore((s) => s.accessToken);
  const setUser = useAuthStore((s) => s.setUser);

  const { data: user, isLoading } = useGetMe();

  useEffect(() => {
    if (user) {
      setUser(user);
    }
  }, [user, setUser]);

  if (!accessToken) {
    return <Navigate to="/login" replace />;
  }

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return <Outlet />;
};