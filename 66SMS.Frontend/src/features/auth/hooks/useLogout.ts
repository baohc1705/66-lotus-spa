import { useMutation, useQueryClient } from "@tanstack/react-query";
import { authApi } from "@/features/auth/api/authApi";
import { useAuthStore } from "@/features/auth/stores/authStore";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

export const useLogout = () => {
  const { clearAuth } = useAuthStore();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: authApi.logout,
    onSettled: () => {
      clearAuth();
      queryClient.clear();
      navigate("/login");
    },
    onError: () => toast.error("Đăng xuất thất bại"),
  });
};
