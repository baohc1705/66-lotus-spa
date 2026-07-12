import { useEffect } from 'react';
import { authApi } from '@/features/auth/api/authApi';
import { useAuthStore } from '@/features/auth/stores/authStore';
import { isAccessTokenValid } from '@/features/auth/utils/jwt';

/**
 * Bootstrap phiên đăng nhập:
 * 1. Token còn hạn trong sessionStorage → dùng luôn, KHÔNG gọi API
 * 2. Token hết hạn / không có → gọi refresh 1 lần (cookie)
 * 3. Refresh fail → clearAuth (khách)
 */
export function AuthBootstrap({ children }: { children: React.ReactNode }) {
  const setSession = useAuthStore((s) => s.setSession);
  const clearAuth = useAuthStore((s) => s.clearAuth);
  const setAuthReady = useAuthStore((s) => s.setAuthReady);
  const isAuthReady = useAuthStore((s) => s.isAuthReady);

  useEffect(() => {
    let cancelled = false;

    async function bootstrap() {
      // Đợi zustand đọc xong sessionStorage
      await useAuthStore.persist.rehydrate();
      if (cancelled) return;

      const token = useAuthStore.getState().accessToken;
      if (token && isAccessTokenValid(token)) {
        setAuthReady(true);
        return;
      }

      // Token hết hạn hoặc chưa có → thử refresh 1 lần
      try {
        const result = await authApi.refreshToken('');
        if (cancelled) return;

        if (result.isSuccess && result.data) {
          setSession(result.data);
        } else {
          clearAuth();
        }
      } catch {
        if (!cancelled) clearAuth();
      } finally {
        if (!cancelled) setAuthReady(true);
      }
    }

    bootstrap();
    return () => {
      cancelled = true;
    };
  }, [setSession, clearAuth, setAuthReady]);

  if (!isAuthReady) {
    return (
      <div className="flex min-h-screen items-center justify-center text-sm text-muted-foreground">
        Đang tải phiên đăng nhập...
      </div>
    );
  }

  return <>{children}</>;
}
