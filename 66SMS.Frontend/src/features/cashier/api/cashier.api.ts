import type { CreateBookingPayload } from "@/features/booking/types/booking.types";
import axiosInstance from "@/shared/api/axiosInstance";
import type { Result } from "@/shared/types/common.types";
import { formatDate } from "@/shared/utils/date.utils";
import {
  type StaffAvailabilityDto,
  type CashierDailyDto,
  type CashierPosition,
} from "../types";

export type CreateCashierAppointmentPayload = CreateBookingPayload & {
  customerId: number;
};

export type GetCashierDailyParams = {
  date?: string;
  endDate?: string;
  salonId?: number | null;
};

export type GetCashierPositionsParams = {
  salonId?: number | null;
  date?: string | null;
};

export type GetStaffAvailabilityParams = {
  date?: string;
  startTime?: string;
  serviceId?: number;
  salonId?: number | null;
};

function toDateOnly(date: Date): string {
  return formatDate(date).format("YYYY-MM-DD");
}

function withSalonId(salonId?: number | null) {
  return salonId !== undefined && salonId !== null ? { salonId } : {};
}

export const cashierApi = {
  getDaily: (date: Date, salonId?: number | null) =>
    axiosInstance
      .get<Result<CashierDailyDto>>("/cashier/daily", {
        params: {
          date: toDateOnly(date),
          ...withSalonId(salonId),
        } satisfies GetCashierDailyParams,
      })
      .then((r) => r.data),

  getWeekly: (startDate: Date, endDate: Date, salonId?: number | null) =>
    axiosInstance
      .get<Result<CashierDailyDto>>("/cashier/weekly", {
        params: {
          date: toDateOnly(startDate),
          endDate: toDateOnly(endDate),
          ...withSalonId(salonId),
        } satisfies GetCashierDailyParams,
      })
      .then((r) => r.data),

  createAppointment: (payload: CreateCashierAppointmentPayload) =>
    axiosInstance
      .post<Result<number[]>>("/cashier/appointments", payload)
      .then((r) => r.data),

  updateBookingStatus: (id: string | number, status: number, note?: string) =>
    axiosInstance
      .put<Result<void>>(`/cashier/appointments/${id}/status`, {
        status,
        note,
      })
      .then((r) => r.data),

  getPositions: (salonId?: number | null, date?: string | null) =>
    axiosInstance
      .get<Result<CashierPosition[]>>("/cashier/positions", {
        params: {
          ...withSalonId(salonId),
          ...(date ? { date } : {}),
        } satisfies GetCashierPositionsParams,
      })
      .then((r) => r.data),

  assignPosition: (appointmentId: string | number, positionId: number) =>
    axiosInstance
      .put<
        Result<void>
      >(`/cashier/appointments/${appointmentId}/position/${positionId}`)
      .then((r) => r.data),

  assignStaff: (appointmentId: string | number, staffId: number) =>
    axiosInstance
      .put<
        Result<void>
      >(`/cashier/appointments/${appointmentId}/staff/${staffId}`)
      .then((r) => r.data),

  rescheduleAppointment: (
    appointmentId: string | number,
    payload: { appointmentDate: string; slotId: number; startTime?: string },
  ) =>
    axiosInstance
      .put<Result<void>>(
        `/cashier/appointments/${appointmentId}/reschedule`,
        payload,
      )
      .then((r) => r.data),

  payBooking: (id: string | number, paymentMethod: string, note?: string) =>
    axiosInstance
      .post<Result<void>>(`/cashier/appointments/${id}/pay`, {
        paymentMethod,
        note,
      })
      .then((r) => r.data),

  createVnPayUrl: (appointmentId: string | number) =>
    axiosInstance
      .get<Result<string>>(`/cashier/vnpay/create-url/${appointmentId}`)
      .then((r) => r.data),

  vnPayReturn: (queryString: string) =>
    axiosInstance
      .get<
        Result<{ appointmentId: number; paymentPhase: string; message: string }>
      >(`/cashier/vnpay-return?${queryString}`)
      .then((r) => r.data),

  getStaffAvailability: (
    date: Date,
    startTime: string,
    serviceId: number,
    salonId?: number | null,
  ) =>
    axiosInstance
      .get<Result<StaffAvailabilityDto[]>>("/cashier/staff-availability", {
        params: {
          date: toDateOnly(date),
          startTime,
          serviceId,
          ...withSalonId(salonId),
        } satisfies GetStaffAvailabilityParams,
      })
      .then((r) => r.data),
};
