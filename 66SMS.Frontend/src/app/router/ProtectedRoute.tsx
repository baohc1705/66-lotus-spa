import { Navigate, Outlet } from 'react-router-dom';
import { useEffect } from 'react';

import { useAuthStore } from '@/features/auth/stores/authStore';
import { useGetMe } from '@/features/users/hooks/useGetMe';

export const ProtectedRoute = () => {
  const accessToken = useAuthStore((s) => s.accessToken);
  const userStore = useAuthStore((s) => s.user);
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

  // Chặn UI với màn hình Loading CHỈ khi store chưa có thông tin user
  if (!userStore && isLoading) {
    return <div>Loading...</div>;
  }

  return <Outlet />;
};