import axiosInstance from "@/shared/api/axiosInstance";
import type {
  Result,
  PagedResult,
  PageRequest,
} from "@/shared/types/common.types";
import type {
  WorkScheduleDTO,
  CreateWorkSchedulePayload,
  UpdateWorkSchedulePayload,
} from "../types/schedule.types";

const BASE = "/WorkerSchedule"; // Path in backend

export const scheduleApi = {
  // Get All
  getAll: (params: PageRequest) =>
    axiosInstance
      .get<Result<PagedResult<WorkScheduleDTO>>>(BASE, { params })
      .then((r) => r.data),

  // Get Detail
  getDetail: (id: number) =>
    axiosInstance
      .get<Result<WorkScheduleDTO>>(`${BASE}/${id}`)
      .then((r) => r.data),

  // Create Work Schedule
  create: (payload: CreateWorkSchedulePayload) =>
    axiosInstance.post<Result<object>>(BASE, payload).then((r) => r.data),

  // Update Work Schedule
  update: (id: number, payload: UpdateWorkSchedulePayload) =>
    axiosInstance
      .patch<Result<object>>(`${BASE}/${id}`, payload)
      .then((r) => r.data),

  // Delete Work Schedule
  delete: (id: number) =>
    axiosInstance.delete<Result<object>>(`${BASE}/${id}`).then((r) => r.data),
};
