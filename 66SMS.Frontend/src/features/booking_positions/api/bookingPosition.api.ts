import type {
  BookingPositionDto,
  CreateBookingPositionRequest,
  GetAllBookingPositionQuery,
  UpdateBookingPositionRequest,
} from "@/features/booking_positions/types/bookingPosition.types";
import axiosInstance from "@/shared/api/axiosInstance";
import type { PagedResult, Result } from "@/shared/types/common.types";

export const bookingPositionApi = {
  // Query API
  getAll: async (
    params: GetAllBookingPositionQuery,
  ): Promise<Result<PagedResult<BookingPositionDto>>> => {
    const response = await axiosInstance.get("/booking-positions", { params });
    return response.data;
  },

  getDetail: async (id: number): Promise<Result<BookingPositionDto>> => {
    const response = await axiosInstance.get(`/booking-positions/${id}`);
    return response.data;
  },

  // Command API
  create: async (
    request: CreateBookingPositionRequest,
  ): Promise<Result<object>> => {
    const response = await axiosInstance.post<Result<object>>(
      "/booking-positions",
      request,
    );
    return response.data;
  },

  update: async (
    id: number,
    request: UpdateBookingPositionRequest,
  ): Promise<Result<object>> => {
    const response = await axiosInstance.patch<Result<object>>(
      `/booking-positions/${id}`,
      request,
    );
    return response.data;
  },

  delete: async (id: number): Promise<Result<object>> => {
    const response = await axiosInstance.delete<Result<object>>(
      `/booking-positions/${id}`,
    );
    return response.data;
  },
};
