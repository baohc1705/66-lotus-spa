import { useMutation, useQueryClient } from "@tanstack/react-query";
import { profileApi } from "../api/profile.api";
import { toast } from "sonner";
import type { AxiosError } from "axios";
import type { Result } from "@/shared/types/common.types";

import { getErrorMessage } from "@/shared/utils/errorUtils";

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
      toast.error(getErrorMessage(error, "Không thể kết nối đến máy chủ"));
    },
  });
}
