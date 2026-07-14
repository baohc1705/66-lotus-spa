import axiosInstance from "@/shared/api/axiosInstance";
import { API } from "@/shared/api/endpoints";
import type { Result, PagedResult } from "@/shared/types/common.types";
import type {
  CreateBookingPositionPayload,
  BookingPositionDTO,
  UpdateBookingPositionPayload,
  BookingPositionListParams,
} from "../types/booking_position.types";

const BASE = API.bookingPositions;

export const bookingPositionApi = {
  getAll: (params: BookingPositionListParams) =>
    axiosInstance
      .get<Result<PagedResult<BookingPositionDTO>>>(BASE, { params })
      .then((r) => r.data),

  getDetail: (id: number) =>
    axiosInstance
      .get<Result<BookingPositionDTO>>(`${BASE}/${id}`)
      .then((r) => r.data),

  create: (payload: CreateBookingPositionPayload) =>
    axiosInstance.post<Result<object>>(BASE, payload).then((r) => r.data),

  update: (id: number, payload: UpdateBookingPositionPayload) =>
    axiosInstance
      .patch<Result<object>>(`${BASE}/${id}`, payload)
      .then((r) => r.data),

  delete: (id: number) =>
    axiosInstance.delete<Result<object>>(`${BASE}/${id}`).then((r) => r.data),
};
