import { useAuthStore } from "@/features/auth/stores/authStore";

export const usePermission = () => {
  // Lấy các hàm kiểm tra quyền và vai trò từ auth store
  const { hasPermission, hasRole } = useAuthStore();

  // Trả về để component sử dụng
  return {
    hasPermission, // kiểm tra quyền (VD: user.create)
    hasRole, // kiểm tra vai trò (VD: Admin)
  };
};
