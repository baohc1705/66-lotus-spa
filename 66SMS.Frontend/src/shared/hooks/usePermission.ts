// Hook kiểm tra quyền của user đang đăng nhập.
// Trả về:
//   hasPermission(resource, action) — kiểm tra quyền cụ thể (vd: 'staffs', 'update')
//   hasRole(role)                   — kiểm tra vai trò (vd: 'Admin', 'Manager')
import { useAuthStore } from "@/features/auth/stores/authStore";

export const usePermission = () => {
  // Explicitly subscribe to user so components re-render when user is fetched/updated after F5
  useAuthStore((state) => state.user);
  const hasPermission = useAuthStore((state) => state.hasPermission);
  const hasRole = useAuthStore((state) => state.hasRole);

  return {
    hasPermission,
    hasRole,
  };
};
