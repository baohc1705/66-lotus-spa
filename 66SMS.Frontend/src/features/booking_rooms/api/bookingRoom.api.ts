import axiosInstance from "@/shared/api/axiosInstance";
import type { Result, PagedResult } from "@/shared/types/common.types";
import type {
  CreateBookingRoomPayload,
  BookingRoomDTO,
  UpdateBookingRoomPayload,
  BookingRoomListParams,
} from "../types/booking_room.types";


export const bookingRoomApi = {
  getAll: (params: BookingRoomListParams) =>
    axiosInstance
      .get<Result<PagedResult<BookingRoomDTO>>>("/booking-rooms", { params })
      .then((r) => r.data),

  getDetail: (id: number) =>
    axiosInstance
      .get<Result<BookingRoomDTO>>(`/booking-rooms/${id}`)
      .then((r) => r.data),

  create: (payload: CreateBookingRoomPayload) =>
    axiosInstance.post<Result<object>>("/booking-rooms", payload).then((r) => r.data),

  update: (id: number, payload: UpdateBookingRoomPayload) =>
    axiosInstance
      .patch<Result<object>>(`/booking-rooms/${id}`, payload)
      .then((r) => r.data),

  delete: (id: number) =>
    axiosInstance.delete<Result<object>>(`/booking-rooms/${id}`).then((r) => r.data),
};
