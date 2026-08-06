import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { isAxiosError } from "axios";
import { cashierApi } from "../api/cashier.api";
import type { CreateCashierAppointmentPayload } from "../api/cashier.api";
import type { CashierBooking, CashierDailyDto } from "../types";

function getApiError(error: unknown, fallback: string): string {
  if (isAxiosError(error)) {
    const body = error.response?.data as { message?: string } | undefined;
    if (body?.message) return body.message;
  }
  return error instanceof Error ? error.message : fallback;
}

export function useCashierData(
  date: Date,
  salonId?: number | null,
  enabled = true,
) {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["cashier-daily", date.toDateString(), salonId],
    queryFn: async () => {
      const res = await cashierApi.getDaily(date, salonId);
      if (!res.isSuccess || !res.data) {
        throw new Error(res.message || "Lỗi tải dữ liệu");
      }
      return res.data;
    },
    enabled,
    staleTime: 30_000,
  });

  const moveBooking = (
    bookingId: string,
    newStaffId: number,
    newStartTime: string,
  ) => {
    queryClient.setQueryData(
      ["cashier-daily", date.toDateString(), salonId],
      (old: CashierDailyDto | undefined) => {
        if (!old) return old;
        const newBookings = old.bookings.map((b: CashierBooking) => {
          if (b.id !== bookingId) return b;
          const [sh, sm] = b.startTime.split(":").map(Number);
          const [eh, em] = b.endTime.split(":").map(Number);
          const dur = eh * 60 + em - (sh * 60 + sm);
          const [nsh, nsm] = newStartTime.split(":").map(Number);
          const end = nsh * 60 + nsm + dur;
          const endStr = `${Math.floor(end / 60)
            .toString()
            .padStart(2, "0")}:${(end % 60).toString().padStart(2, "0")}`;
          return {
            ...b,
            staffId: newStaffId,
            startTime: newStartTime,
            endTime: endStr,
          };
        });
        return { ...old, bookings: newBookings };
      },
    );
  };

  return {
    data: query.data
      ? { columns: query.data.columns, bookings: query.data.bookings }
      : null,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error
      ? getApiError(query.error, "Không tải được lịch hẹn")
      : null,
    refetch: query.refetch,
    moveBooking,
  };
}

export function useCashierWeekly(
  startDate: Date,
  endDate: Date,
  salonId?: number | null,
  enabled = true,
) {
  const query = useQuery({
    queryKey: [
      "cashier-weekly",
      startDate.toDateString(),
      endDate.toDateString(),
      salonId,
    ],
    queryFn: async () => {
      const res = await cashierApi.getWeekly(startDate, endDate, salonId);
      if (!res.isSuccess || !res.data) {
        throw new Error(res.message || "Lỗi tải dữ liệu tuần");
      }
      return res.data;
    },
    enabled,
    staleTime: 30_000,
  });

  return {
    data: query.data
      ? { columns: query.data.columns, bookings: query.data.bookings }
      : null,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error
      ? getApiError(query.error, "Không tải được lịch hẹn tuần")
      : null,
    refetch: query.refetch,
  };
}

export function useCreateCashierAppointment() {
  return useMutation({
    mutationFn: async (payload: CreateCashierAppointmentPayload) => {
      const res = await cashierApi.createAppointment(payload);
      if (!res.isSuccess) {
        throw new Error(res.message || "Đặt lịch thất bại");
      }
      return res;
    },
  });
}
