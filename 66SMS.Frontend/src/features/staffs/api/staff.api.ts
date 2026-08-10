import axiosInstance from "@/shared/api/axiosInstance";
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


export const staffApi = {
  getAll: (
    params: PageRequest & { salonId?: number | null; role?: string | null },
  ) =>
    axiosInstance
      .get<Result<PagedResult<StaffDto>>>("/staffs", { params })
      .then((r) => r.data),
  adminGetAll: (
    params: PageRequest & { salonId?: number | null; role?: string | null },
  ) =>
    axiosInstance
      .get<Result<PagedResult<StaffDto>>>(`/staffs/admin`, { params })
      .then((r) => r.data),

  getDetail: (id: number) =>
    axiosInstance
      .get<Result<StaffFullDto>>(`/staffs/${id}`)
      .then((r) => r.data),

  create: (payload: CreateStaffPayload) =>
    axiosInstance.post<Result<object>>("/staffs", payload).then((r) => r.data),

  update: (id: number, payload: UpdateStaffPayload) =>
    axiosInstance
      .patch<Result<object>>(`/staffs/${id}`, payload)
      .then((r) => r.data),

  delete: (id: number) =>
    axiosInstance.delete<Result<object>>(`/staffs/${id}`).then((r) => r.data),

  getStaffServices: (
    params: PageRequest & {
      staffId?: number | null;
      serviceId?: number | null;
    },
  ) =>
    axiosInstance
      .get<Result<PagedResult<StaffServiceDto>>>(`/staffs/services`, { params })
      .then((r) => r.data),

  createStaffServices: (payload: CreateStaffServicePayload) =>
    axiosInstance
      .post<Result<number[]>>(`/staffs/services`, payload)
      .then((r) => r.data),

  updateStaffService: (id: number, payload: UpdateStaffServicePayload) =>
    axiosInstance
      .patch<Result<object>>(`/staffs/services/${id}`, payload)
      .then((r) => r.data),

  deleteStaffServices: (payload: DeleteStaffServicePayload) =>
    axiosInstance
      .delete<Result<object>>(`/staffs/services`, { data: payload })
      .then((r) => r.data),
};
