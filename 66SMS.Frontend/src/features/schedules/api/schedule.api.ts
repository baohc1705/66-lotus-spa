import axiosInstance from "@/shared/api/axiosInstance";
import type { Result, PagedResult } from "@/shared/types/common.types";
import type {
  WorkScheduleDTO,
  CreateWorkSchedulePayload,
  BulkCreateWorkSchedulePayload,
  UpdateWorkSchedulePayload,
  GetWorkSchedulesParams,
} from "../types/schedule.types";


export const scheduleApi = {
  getAll: (params: GetWorkSchedulesParams) =>
    axiosInstance
      .get<Result<PagedResult<WorkScheduleDTO>>>("/worker-schedule", { params })
      .then((r) => r.data),

  getDetail: (id: number) =>
    axiosInstance
      .get<Result<WorkScheduleDTO>>(`/worker-schedule/${id}`)
      .then((r) => r.data),

  create: (payload: CreateWorkSchedulePayload) =>
    axiosInstance.post<Result<object>>("/worker-schedule", payload).then((r) => r.data),

  bulkCreate: (payload: BulkCreateWorkSchedulePayload) =>
    axiosInstance
      .post<Result<object>>(`/worker-schedule/bulk`, payload)
      .then((r) => r.data),

  update: (id: number, payload: UpdateWorkSchedulePayload) =>
    axiosInstance
      .patch<Result<object>>(`/worker-schedule/${id}`, payload)
      .then((r) => r.data),

  delete: (id: number) =>
    axiosInstance.delete<Result<object>>(`/worker-schedule/${id}`).then((r) => r.data),
};
