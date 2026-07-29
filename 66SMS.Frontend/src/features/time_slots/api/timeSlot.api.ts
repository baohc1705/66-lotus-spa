import axiosInstance from "@/shared/api/axiosInstance";
import { API } from "@/shared/api/endpoints";
import type {
  Result,
  PagedResult,
  PageRequest,
} from "@/shared/types/common.types";
import type {
  CreateTimeSlotPayload,
  TimeSlotDTO,
  UpdateTimeSlotPayload,
} from "../types/time_slot.types";

const BASE = API.timeSlots;

export const timeSlotApi = {
  getAll: (params: PageRequest) =>
    axiosInstance
      .get<Result<PagedResult<TimeSlotDTO>>>(BASE, { params })
      .then((r) => r.data),
  getDetail: (id: number) =>
    axiosInstance.get<Result<TimeSlotDTO>>(`${BASE}/${id}`).then((r) => r.data),

  create: (payload: CreateTimeSlotPayload) =>
    axiosInstance.post<Result<object>>(BASE, payload).then((r) => r.data),

  update: (id: number, payload: UpdateTimeSlotPayload) =>
    axiosInstance
      .patch<Result<object>>(`${BASE}/${id}`, payload)
      .then((r) => r.data),

  delete: (id: number) =>
    axiosInstance.delete<Result<object>>(`${BASE}/${id}`).then((r) => r.data),
};
