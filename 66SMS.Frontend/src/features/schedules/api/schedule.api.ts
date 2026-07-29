import axiosInstance from "@/shared/api/axiosInstance";
import { API } from "@/shared/api/endpoints";
import type { Result, PagedResult } from "@/shared/types/common.types";
import type {
  WorkScheduleDTO,
  CreateWorkSchedulePayload,
  BulkCreateWorkSchedulePayload,
  UpdateWorkSchedulePayload,
  GetWorkSchedulesParams,
} from "../types/schedule.types";

const BASE = API.workSchedule;

export const scheduleApi = {
  getAll: (params: GetWorkSchedulesParams) =>
    axiosInstance
      .get<Result<PagedResult<WorkScheduleDTO>>>(BASE, { params })
      .then((r) => r.data),

  getDetail: (id: number) =>
    axiosInstance
      .get<Result<WorkScheduleDTO>>(`${BASE}/${id}`)
      .then((r) => r.data),

  create: (payload: CreateWorkSchedulePayload) =>
    axiosInstance.post<Result<object>>(BASE, payload).then((r) => r.data),

  bulkCreate: (payload: BulkCreateWorkSchedulePayload) =>
    axiosInstance
      .post<Result<object>>(`${BASE}/bulk`, payload)
      .then((r) => r.data),

  update: (id: number, payload: UpdateWorkSchedulePayload) =>
    axiosInstance
      .patch<Result<object>>(`${BASE}/${id}`, payload)
      .then((r) => r.data),

  delete: (id: number) =>
    axiosInstance.delete<Result<object>>(`${BASE}/${id}`).then((r) => r.data),
};
