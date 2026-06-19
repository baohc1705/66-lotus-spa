import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { AxiosError } from "axios";
import { usersApi } from "@/features/users/api/usersApi";
import { getErrorMessage } from "@/shared/utils/errorUtils";
import { userKeys } from "./useGetMe";
import { toast } from "sonner";
import type { Result } from "@/shared/types/common.types";

export const useCreateUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: usersApi.create,
    onSuccess: (result) => {
      if (result.isSuccess) {
        toast.success("Tạo tài khoản thành công");
        queryClient.invalidateQueries({ queryKey: userKeys.lists() });
      } else {
        toast.error(result.message);
      }
    },
    onError: (error: AxiosError<Result<unknown>>) => toast.error(getErrorMessage(error)),
  });
};
