import { useMutation } from "@tanstack/react-query";
import type { AxiosError } from "axios";
import { authApi } from "@/features/auth/api/authApi";
import { useAuthStore } from "@/features/auth/stores/authStore";
import { usersApi } from "@/features/users/api/usersApi";
import { staffSalonApi } from "@/features/staff_salons/api/staff-salon.api";
import { getErrorMessage } from "@/shared/utils/errorUtils";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import type { Result } from "@/shared/types/common.types";

export const useLogin = () => {
  const { setAccessToken, setUser } = useAuthStore();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: authApi.login,
    onSuccess: async (result) => {
      if (!result.isSuccess || !result.data) {
        toast.error(result.message);
        return;
      }
      setAccessToken(result.data.accessToken);

      const meRes = await usersApi.getMe();
      if (meRes.isSuccess && meRes.data) {
        const userData = meRes.data;
        setUser(userData);

        if (userData.staffInfo?.id) {
          try {
            const staffSalonRes = await staffSalonApi.getDetailByStaffId(
              userData.staffInfo.id,
            );
            if (staffSalonRes.isSuccess && staffSalonRes.data) {
              useAuthStore.getState().setMySalon(staffSalonRes.data);
            }
          } catch (e) {
            console.error("Error fetching staff salon info", e);
          }
        }

        const roles = userData.roles ?? [];
        const isCustomer = roles.some((r) => r.toLowerCase() === "customer");
        if (!isCustomer) {
          navigate("/admin");
        } else {
          navigate("/");
        }
      }
    },
    onError: (error: AxiosError<Result<unknown>>) =>
      toast.error(getErrorMessage(error, "Đăng nhập thất bại")),
  });
};
