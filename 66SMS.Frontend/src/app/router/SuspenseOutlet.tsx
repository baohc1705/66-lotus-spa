import { Suspense, type ReactNode } from "react";

export function RouteFallback() {
  return (
    <div className="flex min-h-40 items-center justify-center p-6 text-sm text-kit-muted">
      Đang tải...
    </div>
  );
}

export function SuspenseOutlet({ children }: { children: ReactNode }) {
  return <Suspense fallback={<RouteFallback />}>{children}</Suspense>;
}
