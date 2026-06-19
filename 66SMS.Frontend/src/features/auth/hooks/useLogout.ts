import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { AxiosError } from "axios";
import { authApi } from "@/features/auth/api/authApi";
import { useAuthStore } from "@/features/auth/stores/authStore";
import { getErrorMessage } from "@/shared/utils/errorUtils";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import type { Result } from "@/shared/types/common.types";

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
    onError: (error: AxiosError<Result<unknown>>) => toast.error(getErrorMessage(error, 'Đăng xuất thất bại')),
  });
};
