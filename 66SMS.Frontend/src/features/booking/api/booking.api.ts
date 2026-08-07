import axiosInstance from "@/shared/api/axiosInstance";
import { API } from "@/shared/api/endpoints";
import type { PagedResult, Result } from "@/shared/types/common.types";
import type {
  AppointmentDto,
  ActivePromotionDto,
  BookingDayDto,
  BookingPositionDTO,
  CreateAppointmentPayload,
  CreateSlotLockPayload,
  GetAllAppointmentParams,
  GetAvailableBookingDaysParams,
  GetTechniciansParams,
  GetTimeSlotsParams,
  PromotionValidationDto,
  TechnicianDTO,
  TimeSlotDTO,
} from "../types/booking.types";

const APPOINTMENT_BASE = API.appointment;
const POSITION_BASE = API.bookingPositions;
const PROMOTION_BASE = API.promotions;

export const bookingApi = {
  getAvailableDays: async (
    params: GetAvailableBookingDaysParams = {},
  ): Promise<BookingDayDto[]> => {
    const res = await axiosInstance.get<Result<BookingDayDto[]>>(
      `${APPOINTMENT_BASE}/available-days`,
      { params: { days: params.days ?? 7 } },
    );
    return res.data.data || [];
  },

  getTechnicians: async (
    params: GetTechniciansParams,
  ): Promise<TechnicianDTO[]> => {
    const res = await axiosInstance.get<Result<TechnicianDTO[]>>(
      `${APPOINTMENT_BASE}/technicians`,
      { params },
    );
    return res.data.data || [];
  },

  getPositions: async (): Promise<BookingPositionDTO[]> => {
    const res = await axiosInstance.get<
      Result<PagedResult<BookingPositionDTO>>
    >(POSITION_BASE, { params: { pageIndex: 1, pageSize: 100 } });
    return res.data.data?.items || [];
  },

  getTimeSlots: async (params: GetTimeSlotsParams): Promise<TimeSlotDTO[]> => {
    const res = await axiosInstance.get<Result<TimeSlotDTO[]>>(
      `${APPOINTMENT_BASE}/time-slots`,
      { params },
    );
    return res.data.data || [];
  },

  createSlotLock: async (
    payload: CreateSlotLockPayload,
  ): Promise<{ success: boolean; lockIds: number[] }> => {
    const res = await axiosInstance.post<Result<number[]>>(
      `${APPOINTMENT_BASE}/lock`,
      payload,
    );
    return { success: res.data.isSuccess, lockIds: res.data.data || [] };
  },

  createBooking: async (
    payload: CreateAppointmentPayload,
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

  getActivePromotions: async (): Promise<ActivePromotionDto[]> => {
    const res = await axiosInstance.get<Result<ActivePromotionDto[]>>(
      `${PROMOTION_BASE}/active`,
    );
    return res.data.data ?? [];
  },

  getMyBookings: async (): Promise<AppointmentDto[]> => {
    const res = await axiosInstance.get<Result<PagedResult<AppointmentDto>>>(
      `${APPOINTMENT_BASE}/me`,
    );
    return res.data.data?.items || [];
  },

  getByUserId: async (
    params: GetAllAppointmentParams,
  ): Promise<PagedResult<AppointmentDto>> => {
    const pageIndex = params.pageIndex ?? 1;
    const pageSize = params.pageSize ?? 5;
    const res = await axiosInstance.get<Result<PagedResult<AppointmentDto>>>(
      APPOINTMENT_BASE,
      { params: { ...params, pageIndex, pageSize } },
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
