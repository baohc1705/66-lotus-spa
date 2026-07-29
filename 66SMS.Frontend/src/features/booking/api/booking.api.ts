import axiosInstance from "@/shared/api/axiosInstance";
import { API } from "@/shared/api/endpoints";
import type { PagedResult, Result } from "@/shared/types/common.types";
import type {
  AppointmentDto,
  BookingPositionDTO,
  CreateBookingPayload,
  PromotionValidationDto,
  SlotLockDto,
  TechnicianDTO,
  TimeSlotDTO,
} from "../types/booking.types";

const APPOINTMENT_BASE = API.appointment;
const POSITION_BASE = API.bookingPositions;
const PROMOTION_BASE = API.promotions;

export const bookingApi = {
  getTechnicians: async (
    date: string,
    serviceId: number,
    salonId?: number,
  ): Promise<TechnicianDTO[]> => {
    const res = await axiosInstance.get<Result<TechnicianDTO[]>>(
      `${APPOINTMENT_BASE}/technicians`,
      { params: { date, serviceId, salonId } },
    );
    return res.data.data || [];
  },

  getPositions: async (): Promise<BookingPositionDTO[]> => {
    const res = await axiosInstance.get<
      Result<PagedResult<BookingPositionDTO>>
    >(POSITION_BASE, { params: { pageIndex: 1, pageSize: 100 } });
    return res.data.data?.items || [];
  },

  getTimeSlots: async (
    date: string,
    serviceId: number,
    technicianId?: number,
    salonId?: number,
  ): Promise<TimeSlotDTO[]> => {
    const res = await axiosInstance.get<Result<TimeSlotDTO[]>>(
      `${APPOINTMENT_BASE}/time-slots`,
      { params: { date, serviceId, technicianId, salonId } },
    );
    return res.data.data || [];
  },

  createSlotLock: async (
    payload: SlotLockDto[],
  ): Promise<{ success: boolean; lockIds: number[] }> => {
    const res = await axiosInstance.post<Result<number[]>>(
      `${APPOINTMENT_BASE}/lock`,
      payload,
    );
    return { success: res.data.isSuccess, lockIds: res.data.data || [] };
  },

  createBooking: async (
    payload: CreateBookingPayload,
  ): Promise<{ success: boolean; bookingIds: number[] }> => {
    const res = await axiosInstance.post<Result<number[]>>(
      APPOINTMENT_BASE,
      payload,
    );
    return { success: res.data.isSuccess, bookingIds: res.data.data || [] };
  },

  validatePromotion: async (
    code: string,
    orderTotal: number,
  ): Promise<PromotionValidationDto> => {
    const res = await axiosInstance.get<Result<PromotionValidationDto>>(
      `${PROMOTION_BASE}/validate`,
      { params: { code, orderTotal } },
    );
    if (!res.data.isSuccess || !res.data.data) {
      throw new Error(res.data.message ?? "Mã không hợp lệ");
    }
    return res.data.data;
  },

  getMyBookings: async (): Promise<AppointmentDto[]> => {
    const res = await axiosInstance.get<Result<PagedResult<AppointmentDto>>>(
      `${APPOINTMENT_BASE}/me`,
    );
    return res.data.data?.items || [];
  },

  getByUserId: async (
    userId: number,
    pageIndex = 1,
    pageSize = 5,
  ): Promise<PagedResult<AppointmentDto>> => {
    const res = await axiosInstance.get<Result<PagedResult<AppointmentDto>>>(
      APPOINTMENT_BASE,
      { params: { userId, pageIndex, pageSize } },
    );
    return (
      res.data.data ?? {
        items: [],
        pageIndex,
        pageSize,
        totalCount: 0,
        totalPages: 0,
        hasPreviousPage: false,
        hasNextPage: false,
      }
    );
  },

  getDepositVnPayUrl: async (appointmentId: number): Promise<string> => {
    const res = await axiosInstance.get<Result<string>>(
      `${APPOINTMENT_BASE}/${appointmentId}/deposit-vnpay-url`,
    );
    return res.data.data || "";
  },

  postponeBooking: async (appointmentId: number): Promise<boolean> => {
    const res = await axiosInstance.post<Result<object>>(
      `${APPOINTMENT_BASE}/${appointmentId}/postpone`,
    );
    return res.data.isSuccess;
  },

  payDepositWithWallet: async (appointmentId: number): Promise<boolean> => {
    const res = await axiosInstance.post<Result<object>>(
      `${APPOINTMENT_BASE}/${appointmentId}/pay-deposit-wallet`,
    );
    return res.data.isSuccess;
  },
};
