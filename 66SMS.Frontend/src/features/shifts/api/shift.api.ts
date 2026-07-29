import axiosInstance from "@/shared/api/axiosInstance";
import { API } from "@/shared/api/endpoints";
import type {
  Result,
  PagedResult,
  PageRequest,
} from "@/shared/types/common.types";
import type {
  ShiftDTO,
  CreateShiftPayload,
  UpdateShiftPayload,
} from "../types/shift.types";

const BASE = API.shifts;

export const shiftApi = {
  getAll: (params: PageRequest) =>
    axiosInstance
      .get<Result<PagedResult<ShiftDTO>>>(BASE, { params })
      .then((r) => r.data),

  getDetail: (id: number) =>
    axiosInstance.get<Result<ShiftDTO>>(`${BASE}/${id}`).then((r) => r.data),

  create: (payload: CreateShiftPayload) =>
    axiosInstance.post<Result<object>>(BASE, payload).then((r) => r.data),

  update: (id: number, payload: UpdateShiftPayload) =>
    axiosInstance
      .patch<Result<object>>(`${BASE}/${id}`, payload)
      .then((r) => r.data),

  delete: (id: number) =>
    axiosInstance.delete<Result<object>>(`${BASE}/${id}`).then((r) => r.data),
};
