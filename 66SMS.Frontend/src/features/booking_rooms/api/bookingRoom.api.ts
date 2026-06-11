import axiosInstance from "@/shared/api/axiosInstance";
import type {
  Result,
  PagedResult,
  PageRequest,
} from "@/shared/types/common.types";
import type {
  CreateBookingRoomPayload,
  BookingRoomDTO,
  UpdateBookingRoomPayload,
} from "../types/booking_room.types";

const BASE = "/BookingRooms";

export const bookingRoomApi = {
  // Get All
  getAll: (params: PageRequest) =>
    axiosInstance
      .get<Result<PagedResult<BookingRoomDTO>>>(BASE, { params })
      .then((r) => r.data),
  // Get Detail
  getDetail: (id: number) =>
    axiosInstance
      .get<Result<BookingRoomDTO>>(`${BASE}/${id}`)
      .then((r) => r.data),

  // Create Room
  create: (payload: CreateBookingRoomPayload) =>
    axiosInstance.post<Result<object>>(BASE, payload).then((r) => r.data),

  // Update Room
  update: (id: number, payload: UpdateBookingRoomPayload) =>
    axiosInstance
      .patch<Result<object>>(`${BASE}/${id}`, payload)
      .then((r) => r.data),

  // Delete Room
  delete: (id: number) =>
    axiosInstance.delete<Result<object>>(`${BASE}/${id}`).then((r) => r.data),
};
