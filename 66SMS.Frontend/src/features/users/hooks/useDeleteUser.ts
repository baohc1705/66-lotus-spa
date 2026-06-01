import { useMutation, useQueryClient } from "@tanstack/react-query";
import { usersApi } from "@/features/users/api/usersApi";
import { userKeys } from "./useGetMe";
import { toast } from "sonner";

export const useDeleteUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: usersApi.delete,
    onSuccess: ({ data }) => {
      if (data.isSuccess) {
        toast.success("Xóa người dùng thành công");
        queryClient.invalidateQueries({ queryKey: userKeys.lists() });
      } else {
        toast.error(data.message);
      }
    },
    onError: () => toast.error("Có lỗi xảy ra"),
  });
};
