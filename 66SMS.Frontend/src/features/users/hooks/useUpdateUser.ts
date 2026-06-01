import { useQueryClient, useMutation } from "@tanstack/react-query";
import { usersApi } from "@/features/users/api/usersApi";
import { userKeys } from "./useGetMe";
import { toast } from "sonner";

export const useUpdateUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: usersApi.update,
    onSuccess: ({ data }) => {
      if (data.isSuccess) {
        toast.success("Cập nhật thành công");
        queryClient.invalidateQueries({ queryKey: userKeys.lists() });
      } else {
        toast.error(data.message);
      }
    },
    onError: () => toast.error("Có lỗi xảy ra"),
  });
};
