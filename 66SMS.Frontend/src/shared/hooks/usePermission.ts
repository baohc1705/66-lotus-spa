import { useAuthStore } from "@/features/auth/stores/authStore";

export function usePermission() {
  const user = useAuthStore((s) => s.user);
  const hasPermission = useAuthStore((s) => s.hasPermission);
  const hasRole = useAuthStore((s) => s.hasRole);

  return {
    user,
    hasPermission,
    hasRole,
  };
}
