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

const BASE = "/Shift";

export const shiftApi = {
  // Get All
  getAll: (params: PageRequest) =>
    axiosInstance
      .get<Result<PagedResult<ShiftDTO>>>(BASE, { params })
      .then((r) => r.data),

  // Get Detail
  getDetail: (id: number) =>
    axiosInstance.get<Result<ShiftDTO>>(`${BASE}/${id}`).then((r) => r.data),

  // Create Shift
  create: (payload: CreateShiftPayload) =>
    axiosInstance.post<Result<object>>(BASE, payload).then((r) => r.data),

  // Update Shift (Note: Backend may not have this endpoint yet, but frontend calls it)
  update: (id: number, payload: UpdateShiftPayload) =>
    axiosInstance
      .patch<Result<object>>(`${BASE}/${id}`, payload)
      .then((r) => r.data),

  // Delete Shift
  delete: (id: number) =>
    axiosInstance.delete<Result<object>>(`${BASE}/${id}`).then((r) => r.data),
};
