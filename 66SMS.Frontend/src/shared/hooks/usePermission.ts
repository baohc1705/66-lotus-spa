import { useAuthStore } from "@/features/auth/stores/authStore";

export const usePermission = () => {
  // Explicitly subscribe to user so components re-render when user is fetched/updated after F5
  const user = useAuthStore((state) => state.user);
  const hasPermission = useAuthStore((state) => state.hasPermission);
  const hasRole = useAuthStore((state) => state.hasRole);

  return {
    hasPermission,
    hasRole,
  };
};
