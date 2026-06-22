import axiosInstance from "@/shared/api/axiosInstance";
import { API } from "@/shared/api/endpoints";
import type { Result, PagedResult } from "@/shared/types/common.types";
import type {
  StaffSalonDTO,
  CreateStaffSalonPayload,
  UpdateStaffSalonPayload,
  StaffSalonQueryParams,
} from "../types/staff-salon.types";

const BASE = API.staffSalons;

export interface AssignManagerPayload {
  staffId: number;
  salonId: number;
}

export const staffSalonApi = {
  getAll: (params: StaffSalonQueryParams) =>
    axiosInstance
      .get<Result<PagedResult<StaffSalonDTO>>>(BASE, { params })
      .then((r) => r.data),

  getDetail: (id: number) =>
    axiosInstance
      .get<Result<StaffSalonDTO>>(`${BASE}/${id}`)
      .then((r) => r.data),

  getDetailByStaffId: (staffId: number) =>
    axiosInstance
      .get<Result<StaffSalonDTO>>(`${BASE}/staff/${staffId}`)
      .then((r) => r.data),

  create: (payload: CreateStaffSalonPayload) =>
    axiosInstance.post<Result<number>>(BASE, payload).then((r) => r.data),

  update: (id: number, payload: UpdateStaffSalonPayload) =>
    axiosInstance
      .patch<Result<object>>(`${BASE}/${id}`, payload)
      .then((r) => r.data),

  delete: (id: number) =>
    axiosInstance.delete<Result<object>>(`${BASE}/${id}`).then((r) => r.data),

  assignManager: (payload: AssignManagerPayload) =>
    axiosInstance
      .post<Result<object>>(`${BASE}/assign-manager`, payload)
      .then((r) => r.data),

  removeManager: (payload: AssignManagerPayload) =>
    axiosInstance
      .post<Result<object>>(`${BASE}/remove-manager`, payload)
      .then((r) => r.data),
};

