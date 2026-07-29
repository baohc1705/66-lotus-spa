import axiosInstance from "@/shared/api/axiosInstance";
import { API } from "@/shared/api/endpoints";
import type {
  Result,
  PagedResult,
  PageRequest,
} from "@/shared/types/common.types";
import type {
  StaffDto,
  StaffFullDto,
  StaffServiceDto,
  CreateStaffPayload,
  UpdateStaffPayload,
  CreateStaffServicePayload,
  UpdateStaffServicePayload,
  DeleteStaffServicePayload,
} from "../types/staff.types";

const BASE = API.staffs.base;

export const staffApi = {
  getAll: (
    params: PageRequest & { salonId?: number | null; role?: string | null },
  ) =>
    axiosInstance
      .get<Result<PagedResult<StaffDto>>>(BASE, { params })
      .then((r) => r.data),
  adminGetAll: (
    params: PageRequest & { salonId?: number | null; role?: string | null },
  ) =>
    axiosInstance
      .get<Result<PagedResult<StaffDto>>>(`${BASE}/admin`, { params })
      .then((r) => r.data),

  getDetail: (id: number) =>
    axiosInstance
      .get<Result<StaffFullDto>>(`${BASE}/${id}`)
      .then((r) => r.data),

  create: (payload: CreateStaffPayload) =>
    axiosInstance.post<Result<object>>(BASE, payload).then((r) => r.data),

  update: (id: number, payload: UpdateStaffPayload) =>
    axiosInstance
      .patch<Result<object>>(`${BASE}/${id}`, payload)
      .then((r) => r.data),

  delete: (id: number) =>
    axiosInstance.delete<Result<object>>(`${BASE}/${id}`).then((r) => r.data),

  getStaffServices: (
    params: PageRequest & {
      staffId?: number | null;
      serviceId?: number | null;
    },
  ) =>
    axiosInstance
      .get<Result<PagedResult<StaffServiceDto>>>(`${BASE}/services`, { params })
      .then((r) => r.data),

  createStaffServices: (payload: CreateStaffServicePayload) =>
    axiosInstance
      .post<Result<number[]>>(`${BASE}/services`, payload)
      .then((r) => r.data),

  updateStaffService: (id: number, payload: UpdateStaffServicePayload) =>
    axiosInstance
      .patch<Result<object>>(`${BASE}/services/${id}`, payload)
      .then((r) => r.data),

  deleteStaffServices: (payload: DeleteStaffServicePayload) =>
    axiosInstance
      .delete<Result<object>>(`${BASE}/services`, { data: payload })
      .then((r) => r.data),
};
