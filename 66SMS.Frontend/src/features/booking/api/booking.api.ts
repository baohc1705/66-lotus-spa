import axiosInstance from "@/shared/api/axiosInstance";
import type { Result, PagedResult } from "@/shared/types/common.types";
import type {
  TechnicianDTO,
  TimeSlotDTO,
  BookingPositionDTO,
  SlotLockDto,
  GuestAppointmentDto,
  AppointmentDto,
} from "../types/booking.types";

const APPOINTMENT_BASE = "/Appointment";
const POSITION_BASE = "/BookingPositions";

export const bookingApi = {
  getTechnicians: async (
    date: string,
    serviceId: number
  ): Promise<TechnicianDTO[]> => {
    const res = await axiosInstance.get<Result<TechnicianDTO[]>>(
      `${APPOINTMENT_BASE}/technicians`,
      { params: { date, serviceId } }
    );
    return res.data.data || [];
  },

  getPositions: async (): Promise<BookingPositionDTO[]> => {
    // Assuming BookingPositions returns a PagedResult
    const res = await axiosInstance.get<Result<PagedResult<BookingPositionDTO>>>(
      POSITION_BASE,
      { params: { pageIndex: 1, pageSize: 100 } }
    );
    return res.data.data?.items || [];
  },

  getTimeSlots: async (
    date: string,
    serviceId: number,
    technicianId?: number
  ): Promise<TimeSlotDTO[]> => {
    const res = await axiosInstance.get<Result<TimeSlotDTO[]>>(
      `${APPOINTMENT_BASE}/timeslots`,
      { params: { date, serviceId, technicianId } }
    );
    return res.data.data || [];
  },

  createSlotLock: async (
    payload: SlotLockDto[]
  ): Promise<{ success: boolean; lockIds: number[] }> => {
    const res = await axiosInstance.post<Result<number[]>>(
      `${APPOINTMENT_BASE}/lock`,
      payload
    );
    return { success: res.data.isSuccess, lockIds: res.data.data || [] };
  },

  createBooking: async (
    payload: GuestAppointmentDto[]
  ): Promise<{ success: boolean; bookingIds: number[] }> => {
    const res = await axiosInstance.post<Result<number[]>>(
      APPOINTMENT_BASE,
      payload
    );
    return { success: res.data.isSuccess, bookingIds: res.data.data || [] };
  },

  getMyBookings: async (): Promise<AppointmentDto[]> => {
    const res = await axiosInstance.get<Result<PagedResult<AppointmentDto>>>(
      `${APPOINTMENT_BASE}/me`
    );
    return res.data.data?.items || [];
  },

  getDepositVnPayUrl: async (appointmentId: number): Promise<string> => {
    const res = await axiosInstance.get<Result<string>>(
      `${APPOINTMENT_BASE}/${appointmentId}/deposit-vnpay-url`
    );
    return res.data.data || "";
  },

  postponeBooking: async (appointmentId: number): Promise<boolean> => {
    const res = await axiosInstance.post<Result<object>>(
      `${APPOINTMENT_BASE}/${appointmentId}/postpone`
    );
    return res.data.isSuccess;
  },

  payDepositWithWallet: async (appointmentId: number): Promise<boolean> => {
    const res = await axiosInstance.post<Result<object>>(
      `${APPOINTMENT_BASE}/${appointmentId}/pay-deposit-wallet`
    );
    return res.data.isSuccess;
  },
};
