import { useMutation, useQueryClient } from "@tanstack/react-query";
import { profileApi } from "../api/profile.api";
import { toast } from "sonner";
import type { AxiosError } from "axios";
import type { Result } from "@/shared/types/common.types";

export function useUpdateProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: profileApi.updateProfile,
    onSuccess: (result) => {
      if (result.isSuccess) {
        toast.success("Cập nhật hồ sơ thành công");
        queryClient.invalidateQueries({ queryKey: ["profile"] });
      } else {
        toast.error(result.message ?? "Cập nhật thất bại");
      }
    },
    onError: (error: AxiosError<Result<unknown>>) => {
      const msg = error.response?.data?.message ?? "Không thể kết nối đến máy chủ";
      toast.error(msg);
    },
  });
}
