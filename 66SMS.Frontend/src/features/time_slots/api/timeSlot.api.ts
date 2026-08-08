import axiosInstance from "@/shared/api/axiosInstance";
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


export const timeSlotApi = {
  getAll: (params: PageRequest) =>
    axiosInstance
      .get<Result<PagedResult<TimeSlotDTO>>>("/time-slots", { params })
      .then((r) => r.data),
  getDetail: (id: number) =>
    axiosInstance.get<Result<TimeSlotDTO>>(`/time-slots/${id}`).then((r) => r.data),

  create: (payload: CreateTimeSlotPayload) =>
    axiosInstance.post<Result<object>>("/time-slots", payload).then((r) => r.data),

  update: (id: number, payload: UpdateTimeSlotPayload) =>
    axiosInstance
      .patch<Result<object>>(`/time-slots/${id}`, payload)
      .then((r) => r.data),

  delete: (id: number) =>
    axiosInstance.delete<Result<object>>(`/time-slots/${id}`).then((r) => r.data),
};
