import axiosInstance from "@/shared/api/axiosInstance";
import { API } from "@/shared/api/endpoints";
import type {
  Result,
  PagedResult,
  PageRequest,
} from "@/shared/types/common.types";
import type {
  CreateBookingPositionPayload,
  BookingPositionDTO,
  UpdateBookingPositionPayload,
} from "../types/booking_position.types";

const BASE = API.bookingPositions;

export const bookingPositionApi = {
  // Get All
  getAll: (params: PageRequest) =>
    axiosInstance
      .get<Result<PagedResult<BookingPositionDTO>>>(BASE, { params })
      .then((r) => r.data),
  // Get Detail
  getDetail: (id: number) =>
    axiosInstance
      .get<Result<BookingPositionDTO>>(`${BASE}/${id}`)
      .then((r) => r.data),

  // Create Position
  create: (payload: CreateBookingPositionPayload) =>
    axiosInstance.post<Result<object>>(BASE, payload).then((r) => r.data),

  // Update Position
  update: (id: number, payload: UpdateBookingPositionPayload) =>
    axiosInstance
      .patch<Result<object>>(`${BASE}/${id}`, payload)
      .then((r) => r.data),

  // Delete Position
  delete: (id: number) =>
    axiosInstance.delete<Result<object>>(`${BASE}/${id}`).then((r) => r.data),
};
