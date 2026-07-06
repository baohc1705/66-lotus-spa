import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { AxiosError } from "axios";
import { cashierApi } from "../api/cashier.api";
import { getErrorMessage } from "@/shared/utils/errorUtils";
import type { Result } from "@/shared/types/common.types";

export function useOnlineBookings(salonId?: number | null) {
  return useQuery({
    queryKey: ["cashier-online-bookings", salonId],
    queryFn: async () => {
      const res = await cashierApi.getOnlineBookings(salonId);
      if (!res.isSuccess || !res.data) {
        throw new Error(res.message || "Lỗi tải lịch hẹn online");
      }
      return res.data;
    },
    refetchInterval: 30000, // Poll every 30s
  });
}

export function useUpdateBookingStatus() {
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
      const res = await cashierApi.updateBookingStatus(id, status, note);
      if (!res.isSuccess) {
        throw new Error(res.message || "Cập nhật trạng thái thất bại");
      }
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cashier-online-bookings"] });
      queryClient.invalidateQueries({ queryKey: ["cashier-daily"] });
    },
    onError: (error: AxiosError<Result<unknown>>) => {
      toast.error(getErrorMessage(error, "Cập nhật trạng thái thất bại"));
    },
  });
}
