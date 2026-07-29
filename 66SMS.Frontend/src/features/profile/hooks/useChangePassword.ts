import { useMutation } from "@tanstack/react-query";
import { profileApi } from "../api/profile.api";
import { toast } from "sonner";
import type { AxiosError } from "axios";
import type { Result } from "@/shared/types/common.types";

import { getErrorMessage } from "@/shared/utils/errorUtils";

export function useChangePassword() {
  return useMutation({
    mutationFn: profileApi.changePassword,
    onSuccess: (result) => {
      if (result.isSuccess) {
        toast.success("Đổi mật khẩu thành công");
      } else {
        toast.error(result.message ?? "Đổi mật khẩu thất bại");
      }
    },
    onError: (error: AxiosError<Result<unknown>>) => {
      toast.error(getErrorMessage(error, "Không thể kết nối đến máy chủ"));
    },
  });
}
