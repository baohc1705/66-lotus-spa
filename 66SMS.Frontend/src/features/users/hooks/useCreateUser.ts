import { useMutation, useQueryClient } from "@tanstack/react-query";
import { usersApi } from "@/features/users/api/usersApi";
import { userKeys } from "./useGetMe";
import { toast } from "sonner";

export const useCreateUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: usersApi.create,
    onSuccess: ({ data }) => {
      if (data.isSuccess) {
        toast.success("Tạo tài khoản thành công");
        // Đánh dấu toàn bộ cache của user list là cũ
        // React Query sẽ tự gọi lại API để lấy dữ liệu mới
        queryClient.invalidateQueries({ queryKey: userKeys.lists() });
      } else {
        toast.error(data.message);
      }
    },
    onError: () => toast.error("Có lỗi xảy ra"),
  });
};
