import axiosInstance from "@/shared/api/axiosInstance";
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


export const shiftApi = {
  getAll: (params: PageRequest) =>
    axiosInstance
      .get<Result<PagedResult<ShiftDTO>>>("/shift", { params })
      .then((r) => r.data),

  getDetail: (id: number) =>
    axiosInstance.get<Result<ShiftDTO>>(`/shift/${id}`).then((r) => r.data),

  create: (payload: CreateShiftPayload) =>
    axiosInstance.post<Result<object>>("/shift", payload).then((r) => r.data),

  update: (id: number, payload: UpdateShiftPayload) =>
    axiosInstance
      .patch<Result<object>>(`/shift/${id}`, payload)
      .then((r) => r.data),

  delete: (id: number) =>
    axiosInstance.delete<Result<object>>(`/shift/${id}`).then((r) => r.data),
};
