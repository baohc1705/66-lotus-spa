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
  CreateStaffPayload,
  UpdateStaffPayload,
} from "../types/staff.types";

const BASE = API.staffs.base;

export const staffApi = {
  /** GET /staffs — Danh sách nhân viên (phân trang) — quyền: staffs.read, role: admin */
  getAll: (params: PageRequest & { salonId?: number | null; role?: string | null }) =>
    axiosInstance
      .get<Result<PagedResult<StaffDto>>>(BASE, { params })
      .then((r) => r.data),
  adminGetAll: (params: PageRequest & { salonId?: number | null; role?: string | null }) =>
    axiosInstance
      .get<Result<PagedResult<StaffDto>>>(`${BASE}/admin`, { params })
      .then((r) => r.data),

  /** GET /staffs/:id — Chi tiết nhân viên — quyền: staffs.read */
  getDetail: (id: number) =>
    axiosInstance.get<Result<StaffFullDto>>(`${BASE}/${id}`).then((r) => r.data),

  /** POST /staffs — Tạo nhân viên — quyền: staffs.create, role: admin */
  create: (payload: CreateStaffPayload) =>
    axiosInstance.post<Result<object>>(BASE, payload).then((r) => r.data),

  /** PATCH /staffs/:id — Cập nhật nhân viên — quyền: staffs.update */
  update: (id: number, payload: UpdateStaffPayload) =>
    axiosInstance
      .patch<Result<object>>(`${BASE}/${id}`, payload)
      .then((r) => r.data),

  /** DELETE /staffs/:id — Xóa nhân viên — quyền: staffs.delete, role: admin */
  delete: (id: number) =>
    axiosInstance.delete<Result<object>>(`${BASE}/${id}`).then((r) => r.data),
};
