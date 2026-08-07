import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '@/features/auth/stores/authStore';
import { useNotifications } from '@/features/notifications';

export const ProtectedRoute = () => {
  const accessToken = useAuthStore((s) => s.accessToken);
  const isAuthReady = useAuthStore((s) => s.isAuthReady);

  useNotifications();

  if (!isAuthReady) {
    return (
      <div className="flex min-h-screen items-center justify-center text-sm text-muted-foreground">
        Đang tải...
      </div>
    );
  }

  if (!accessToken) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};
