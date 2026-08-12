import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { AxiosError } from "axios";
import { CASHIER_DAILY } from "@/features/cashier/cashierQueryKey";
import { toast } from "@/shared/components/kitToast";
import { getErrorMessage } from "@/shared/utils/errorUtils";
import type { Result } from "@/shared/types/common.types";
import { staffScheduleApi } from "../api";

export function useUpdateMyBookingStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      status,
      note,
    }: {
      id: string | number;
      status: number;
      note?: string;
    }) => {
      const res = await staffScheduleApi.updateBookingStatus(id, status, note);
      if (!res.isSuccess) {
        throw new Error(res.message || "Cập nhật trạng thái thất bại");
      }
      return res;
    },
    onSuccess: (res) => {
      toast.success(res.message || "Cập nhật trạng thái thành công");
      queryClient.invalidateQueries({ queryKey: ["staff-schedule-daily"] });
      queryClient.invalidateQueries({ queryKey: ["staff-schedule-weekly"] });
      queryClient.invalidateQueries({ queryKey: [CASHIER_DAILY] });
    },
    onError: (error: AxiosError<Result<unknown>>) => {
      toast.error(getErrorMessage(error, "Cập nhật trạng thái thất bại"));
    },
  });
}
