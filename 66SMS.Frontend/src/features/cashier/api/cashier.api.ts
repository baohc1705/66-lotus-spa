import axiosInstance from "@/shared/api/axiosInstance";
import { API } from "@/shared/api/endpoints";
import type { Result } from "@/shared/types/common.types";
import type { CashierBooking, CashierDailyDto } from "../types";

function formatDate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export const cashierApi = {
  getDaily: (date: Date, salonId?: number | null) =>
    axiosInstance
      .get<Result<CashierDailyDto>>(API.cashier.daily, {
        params: { 
          date: formatDate(date),
          ...(salonId !== undefined && salonId !== null ? { salonId } : {})
        },
      })
      .then((r) => r.data),

  getOnlineBookings: (salonId?: number | null) =>
    axiosInstance
      .get<Result<CashierBooking[]>>(API.cashier.onlineAppointments, {
        params: {
          ...(salonId !== undefined && salonId !== null ? { salonId } : {})
        }
      })
      .then((r) => r.data),

  updateBookingStatus: (id: string | number, status: number, note?: string) =>
    axiosInstance
      .put<Result<void>>(`${API.cashier.appointment}/${id}/status`, { id, status, note })
      .then((r) => r.data),

  payBooking: (id: string | number, paymentMethod: string, note?: string) =>
    axiosInstance
      .post<Result<void>>(`${API.cashier.appointment}/${id}/pay`, { id: Number(id), paymentMethod, note })
      .then((r) => r.data),

  createVnPayUrl: (bookingId: string | number) =>
    axiosInstance
      .get<Result<string>>(`${API.cashier.vnpayCreate}/${bookingId}`)
      .then((r) => r.data),

  vnPayReturn: (queryString: string) =>
    axiosInstance
      .get<Result<{ appointmentId: number; paymentPhase: string; message: string }>>(
        `${API.cashier.vnpayReturn}?${queryString}`
      )
      .then((r) => r.data),

  formatDate,
};
