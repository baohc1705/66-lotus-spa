import axiosInstance from "@/shared/api/axiosInstance";
import type { Result } from "@/shared/types/common.types";
import type { CashierBooking, CashierDailyDto } from "../types";

function formatDate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export const cashierApi = {
  getDaily: (date: Date) =>
    axiosInstance
      .get<Result<CashierDailyDto>>("/cashier/daily", {
        params: { date: formatDate(date) },
      })
      .then((r) => r.data),

  getOnlineBookings: () =>
    axiosInstance
      .get<Result<CashierBooking[]>>("/cashier/online-appointments")
      .then((r) => r.data),

  updateBookingStatus: (id: string | number, status: number, note?: string) =>
    axiosInstance
      .put<
        Result<void>
      >(`/cashier/appointments/${id}/status`, { id, status, note })
      .then((r) => r.data),

  payBooking: (id: string | number, paymentMethod: string, note?: string) =>
    axiosInstance
      .post<
        Result<void>
      >(`/cashier/appointments/${id}/pay`, { id: Number(id), paymentMethod, note })
      .then((r) => r.data),

  createVnPayUrl: (bookingId: string | number) =>
    axiosInstance
      .get<Result<string>>(`/cashier/vnpay/create-url/${bookingId}`)
      .then((r) => r.data),

  vnPayReturn: (queryString: string) =>
    axiosInstance
      .get<
        Result<{ appointmentId: number; paymentPhase: string; message: string }>
      >(`/cashier/vnpay-return?${queryString}`)
      .then((r) => r.data),

  formatDate,
};
