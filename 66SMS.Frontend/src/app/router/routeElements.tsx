import { Suspense, type ReactNode } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuthStore } from "@/features/auth/stores/authStore";
import { useNotifications } from "@/features/notifications";

function PageFallback() {
  return (
    <div className="flex min-h-40 items-center justify-center p-6 text-sm text-kit-muted">
      Đang tải...
    </div>
  );
}

export function WithPageSuspense({ children }: { children: ReactNode }) {
  return <Suspense fallback={<PageFallback />}>{children}</Suspense>;
}

export function ProtectedRoute() {
  const accessToken = useAuthStore((state) => state.accessToken);
  const isAuthReady = useAuthStore((state) => state.isAuthReady);

  useNotifications();

  if (isAuthReady != true) {
    return (
      <div className="flex min-h-screen items-center justify-center text-sm text-muted-foreground">
        Đang tải...
      </div>
    );
  }

  if (!accessToken) {
    return <Navigate to="/dang-nhap" replace />;
  }

  return <Outlet />;
}
