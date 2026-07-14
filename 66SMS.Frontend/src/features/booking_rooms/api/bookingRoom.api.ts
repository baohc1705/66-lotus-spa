import axiosInstance from "@/shared/api/axiosInstance";
import { API } from "@/shared/api/endpoints";
import type { Result, PagedResult } from "@/shared/types/common.types";
import type {
  CreateBookingRoomPayload,
  BookingRoomDTO,
  UpdateBookingRoomPayload,
  BookingRoomListParams,
} from "../types/booking_room.types";

const BASE = API.bookingRooms;

export const bookingRoomApi = {
  getAll: (params: BookingRoomListParams) =>
    axiosInstance
      .get<Result<PagedResult<BookingRoomDTO>>>(BASE, { params })
      .then((r) => r.data),

  getDetail: (id: number) =>
    axiosInstance
      .get<Result<BookingRoomDTO>>(`${BASE}/${id}`)
      .then((r) => r.data),

  create: (payload: CreateBookingRoomPayload) =>
    axiosInstance.post<Result<object>>(BASE, payload).then((r) => r.data),

  update: (id: number, payload: UpdateBookingRoomPayload) =>
    axiosInstance
      .patch<Result<object>>(`${BASE}/${id}`, payload)
      .then((r) => r.data),

  delete: (id: number) =>
    axiosInstance.delete<Result<object>>(`${BASE}/${id}`).then((r) => r.data),
};
