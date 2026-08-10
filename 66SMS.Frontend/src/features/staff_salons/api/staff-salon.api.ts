import axiosInstance from "@/shared/api/axiosInstance";
import type { Result, PagedResult } from "@/shared/types/common.types";
import type {
  StaffSalonDTO,
  CreateStaffSalonPayload,
  UpdateStaffSalonPayload,
  StaffSalonQueryParams,
} from "../types/staff-salon.types";


export interface AssignManagerPayload {
  staffId: number;
  salonId: number;
}

export const staffSalonApi = {
  getAll: (params: StaffSalonQueryParams) =>
    axiosInstance
      .get<Result<PagedResult<StaffSalonDTO>>>("/staff-salons", { params })
      .then((r) => r.data),

  getDetail: (id: number) =>
    axiosInstance
      .get<Result<StaffSalonDTO>>(`/staff-salons/${id}`)
      .then((r) => r.data),

  getDetailByStaffId: (staffId: number) =>
    axiosInstance
      .get<Result<StaffSalonDTO>>(`/staff-salons/staff/${staffId}`)
      .then((r) => r.data),

  create: (payload: CreateStaffSalonPayload) =>
    axiosInstance.post<Result<number>>("/staff-salons", payload).then((r) => r.data),

  update: (id: number, payload: UpdateStaffSalonPayload) =>
    axiosInstance
      .patch<Result<object>>(`/staff-salons/${id}`, payload)
      .then((r) => r.data),

  delete: (id: number) =>
    axiosInstance.delete<Result<object>>(`/staff-salons/${id}`).then((r) => r.data),

  assignManager: (payload: AssignManagerPayload) =>
    axiosInstance
      .post<Result<object>>(`/staff-salons/assign-manager`, payload)
      .then((r) => r.data),

  removeManager: (payload: AssignManagerPayload) =>
    axiosInstance
      .post<Result<object>>(`/staff-salons/remove-manager`, payload)
      .then((r) => r.data),
};
