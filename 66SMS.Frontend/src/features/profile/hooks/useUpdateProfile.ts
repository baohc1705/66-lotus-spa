import { useMutation, useQueryClient } from "@tanstack/react-query";
import { profileApi } from "../api/profile.api";
import { toast } from "sonner";

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
    onError: () => {
      toast.error("Không thể kết nối đến máy chủ");
    },
  });
}
