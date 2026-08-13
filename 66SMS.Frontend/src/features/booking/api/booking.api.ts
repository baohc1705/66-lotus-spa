import axiosInstance from "@/shared/api/axiosInstance";
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

export const bookingApi = {
  getAvailableDays: async (
    params: GetAvailableBookingDaysParams = {},
  ): Promise<BookingDayDto[]> => {
    const res = await axiosInstance.get<Result<BookingDayDto[]>>(
      `/appointment/available-days`,
      { params: { days: params.days ?? 7 } },
    );
    return res.data.data || [];
  },

  getTechnicians: async (
    params: GetTechniciansParams,
  ): Promise<TechnicianDTO[]> => {
    const query: Record<string, unknown> = {
      date: params.date,
      salonId: params.salonId,
    };
    if (params.serviceIds && params.serviceIds.length > 0) {
      query.serviceIds = params.serviceIds;
    } else if (params.serviceId) {
      query.serviceId = params.serviceId;
    }
    const res = await axiosInstance.get<Result<TechnicianDTO[]>>(
      `/appointment/technicians`,
      {
        params: query,
        paramsSerializer: {
          indexes: null,
        },
      },
    );
    return res.data.data || [];
  },

  getPositions: async (): Promise<BookingPositionDTO[]> => {
    const res = await axiosInstance.get<
      Result<PagedResult<BookingPositionDTO>>
    >("/booking-positions", { params: { pageIndex: 1, pageSize: 100 } });
    return res.data.data?.items || [];
  },

  getTimeSlots: async (params: GetTimeSlotsParams): Promise<TimeSlotDTO[]> => {
    const query: Record<string, unknown> = {
      date: params.date,
      staffId: params.staffId,
      salonId: params.salonId,
    };
    if (params.serviceIds && params.serviceIds.length > 0) {
      query.serviceIds = params.serviceIds;
    } else if (params.serviceId) {
      query.serviceId = params.serviceId;
    }
    const res = await axiosInstance.get<Result<TimeSlotDTO[]>>(
      `/appointment/time-slots`,
      {
        params: query,
        paramsSerializer: {
          indexes: null,
        },
      },
    );
    return res.data.data || [];
  },

  createSlotLock: async (
    payload: CreateSlotLockPayload,
  ): Promise<{ success: boolean; lockIds: number[]; message?: string }> => {
    const res = await axiosInstance.post<Result<number[]>>(
      `/appointment/lock`,
      payload,
    );
    return {
      success: res.data.isSuccess,
      lockIds: res.data.data || [],
      message: res.data.message,
    };
  },

  releaseSlotLock: async (lockIds: number[]): Promise<boolean> => {
    const res = await axiosInstance.post<Result<object>>(
      `/appointment/lock/release`,
      { lockIds },
    );
    return res.data.isSuccess;
  },

  createBooking: async (
    payload: CreateAppointmentPayload,
  ): Promise<{ success: boolean; bookingIds: number[] }> => {
    const res = await axiosInstance.post<Result<number[]>>(
      "/appointment",
      payload,
    );
    return { success: res.data.isSuccess, bookingIds: res.data.data || [] };
  },

  validatePromotion: async (
    code: string,
    orderTotal: number,
  ): Promise<PromotionValidationDto> => {
    const res = await axiosInstance.get<Result<PromotionValidationDto>>(
      `/promotions/validate`,
      { params: { code, orderTotal } },
    );
    if (!res.data.isSuccess || !res.data.data) {
      throw new Error(res.data.message ?? "Mã không hợp lệ");
    }
    return res.data.data;
  },

  getActivePromotions: async (): Promise<ActivePromotionDto[]> => {
    const res = await axiosInstance.get<Result<ActivePromotionDto[]>>(
      `/promotions/active`,
    );
    return res.data.data ?? [];
  },

  getMyBookings: async (): Promise<AppointmentDto[]> => {
    const res = await axiosInstance.get<Result<PagedResult<AppointmentDto>>>(
      `/appointment/me`,
    );
    return res.data.data?.items || [];
  },

  getDetail: async (id: number): Promise<AppointmentDto> => {
    const res = await axiosInstance.get<Result<AppointmentDto>>(
      `/appointment/${id}`,
    );
    return res.data.data ?? {};
  },

  getByUserId: async (
    params: GetAllAppointmentParams,
  ): Promise<PagedResult<AppointmentDto>> => {
    const pageIndex = params.pageIndex ?? 1;
    const pageSize = params.pageSize ?? 5;
    const res = await axiosInstance.get<Result<PagedResult<AppointmentDto>>>(
      "/appointment",
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
      `/appointment/${appointmentId}/deposit-vnpay-url`,
    );
    return res.data.data || "";
  },

  postponeBooking: async (appointmentId: number): Promise<boolean> => {
    const res = await axiosInstance.post<Result<object>>(
      `/appointment/${appointmentId}/postpone`,
    );
    return res.data.isSuccess;
  },

  payDepositWithWallet: async (appointmentId: number): Promise<boolean> => {
    const res = await axiosInstance.post<Result<object>>(
      `/appointment/${appointmentId}/pay-deposit-wallet`,
    );
    return res.data.isSuccess;
  },
};
