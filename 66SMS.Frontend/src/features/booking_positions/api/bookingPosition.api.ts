import axiosInstance from "@/shared/api/axiosInstance";
import type { Result, PagedResult } from "@/shared/types/common.types";
import type {
  CreateBookingPositionPayload,
  BookingPositionDTO,
  UpdateBookingPositionPayload,
  BookingPositionListParams,
} from "../types/booking_position.types";


export const bookingPositionApi = {
  getAll: (params: BookingPositionListParams) =>
    axiosInstance
      .get<Result<PagedResult<BookingPositionDTO>>>("/booking-positions", { params })
      .then((r) => r.data),

  getDetail: (id: number) =>
    axiosInstance
      .get<Result<BookingPositionDTO>>(`/booking-positions/${id}`)
      .then((r) => r.data),

  create: (payload: CreateBookingPositionPayload) =>
    axiosInstance.post<Result<object>>("/booking-positions", payload).then((r) => r.data),

  update: (id: number, payload: UpdateBookingPositionPayload) =>
    axiosInstance
      .patch<Result<object>>(`/booking-positions/${id}`, payload)
      .then((r) => r.data),

  delete: (id: number) =>
    axiosInstance.delete<Result<object>>(`/booking-positions/${id}`).then((r) => r.data),
};
