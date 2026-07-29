import axiosInstance from "@/shared/api/axiosInstance";
import { API } from "@/shared/api/endpoints";
import type { Result } from "@/shared/types/common.types";
import type { CreateBookingPayload } from "@/features/booking/types/booking.types";
import type {
  CashierBooking,
  CashierDailyDto,
  CashierPosition,
} from "../types";

export type CreateCashierAppointmentPayload = CreateBookingPayload & {
  customerId: number;
};

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
          ...(salonId !== undefined && salonId !== null ? { salonId } : {}),
        },
      })
      .then((r) => r.data),

  getWeekly: (startDate: Date, endDate: Date, salonId?: number | null) =>
    axiosInstance
      .get<Result<CashierDailyDto>>("/cashier/weekly", {
        params: {
          startDate: formatDate(startDate),
          endDate: formatDate(endDate),
          ...(salonId !== undefined && salonId !== null ? { salonId } : {}),
        },
      })
      .then((r) => r.data),

  getOnlineBookings: (salonId?: number | null) =>
    axiosInstance
      .get<Result<CashierBooking[]>>(API.cashier.onlineAppointments, {
        params: {
          ...(salonId !== undefined && salonId !== null ? { salonId } : {}),
        },
      })
      .then((r) => r.data),

  createAppointment: (payload: CreateCashierAppointmentPayload) =>
    axiosInstance
      .post<Result<number[]>>(API.cashier.appointment, payload)
      .then((r) => r.data),

  updateBookingStatus: (id: string | number, status: number, note?: string) =>
    axiosInstance
      .put<
        Result<void>
      >(`${API.cashier.appointment}/${id}/status`, { id, status, note })
      .then((r) => r.data),

  getPositions: (salonId?: number | null, date?: string | null) =>
    axiosInstance
      .get<Result<CashierPosition[]>>(API.cashier.positions, {
        params: {
          ...(salonId !== undefined && salonId !== null ? { salonId } : {}),
          ...(date ? { date } : {}),
        },
      })
      .then((r) => r.data),

  assignPosition: (appointmentId: string | number, positionId: number) =>
    axiosInstance
      .put<Result<void>>(
        `${API.cashier.appointment}/${appointmentId}/position`,
        {
          appointmentId: Number(appointmentId),
          positionId,
        },
      )
      .then((r) => r.data),

  payBooking: (id: string | number, paymentMethod: string, note?: string) =>
    axiosInstance
      .post<
        Result<void>
      >(`${API.cashier.appointment}/${id}/pay`, { id: Number(id), paymentMethod, note })
      .then((r) => r.data),

  createVnPayUrl: (bookingId: string | number) =>
    axiosInstance
      .get<Result<string>>(`${API.cashier.vnpayCreate}/${bookingId}`)
      .then((r) => r.data),

  vnPayReturn: (queryString: string) =>
    axiosInstance
      .get<
        Result<{ appointmentId: number; paymentPhase: string; message: string }>
      >(`${API.cashier.vnpayReturn}?${queryString}`)
      .then((r) => r.data),

  formatDate,
};
