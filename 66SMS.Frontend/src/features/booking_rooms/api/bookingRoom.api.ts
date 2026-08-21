import type {
  BookingRoomDto,
  CreateBookingRoomRequest,
  GetAllBookingRoomQuery,
  UpdateBookingRoomRequest,
} from "@/features/booking_rooms/types/bookingRoom.types";
import axiosInstance from "@/shared/api/axiosInstance";
import type { PagedResult, Result } from "@/shared/types/common.types";

export const bookingRoomApi = {
  // Query API
  getAll: async (
    params: GetAllBookingRoomQuery,
  ): Promise<Result<PagedResult<BookingRoomDto>>> => {
    const response = await axiosInstance.get("/booking-rooms", { params });
    return response.data;
  },

  getDetail: async (id: number): Promise<Result<BookingRoomDto>> => {
    const response = await axiosInstance.get(`/booking-rooms/${id}`);
    return response.data;
  },

  // Command API
  create: async (
    request: CreateBookingRoomRequest,
  ): Promise<Result<object>> => {
    const response = await axiosInstance.post<Result<object>>(
      "/booking-rooms",
      request,
    );
    return response.data;
  },

  update: async (
    id: number,
    request: UpdateBookingRoomRequest,
  ): Promise<Result<object>> => {
    const response = await axiosInstance.patch<Result<object>>(
      `/booking-rooms/${id}`,
      request,
    );
    return response.data;
  },

  delete: async (id: number): Promise<Result<object>> => {
    const response = await axiosInstance.delete<Result<object>>(
      `/booking-rooms/${id}`,
    );
    return response.data;
  },
};
