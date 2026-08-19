import axiosInstance from "@/shared/api/axiosInstance";
import type { Result, PagedResult } from "@/shared/types/common.types";
import type {
  StaffSalonDTO,
  GetAllStaffSalonQuery,
  CreateStaffSalonRequest,
  UpdateStaffSalonRequest,
} from "@/features/salons/types/staffSalon.types";

// export interface AssignManagerPayload {
//   staffId: number;
//   salonId: number;
// }

export const staffSalonApi = {
  // Query API
  getAll: async (
    params: GetAllStaffSalonQuery,
  ): Promise<Result<PagedResult<StaffSalonDTO>>> => {
    const response = await axiosInstance.get("/staff-salons", { params });
    return response.data;
  },

  getDetail: async (id: number): Promise<Result<StaffSalonDTO>> => {
    const response = await axiosInstance.get(`/staff-salons/${id}`);
    return response.data;
  },

  getDetailByStaffId: async (
    staffId: number,
  ): Promise<Result<StaffSalonDTO>> => {
    const response = await axiosInstance.get<Result<StaffSalonDTO>>(
      `/staff-salons/staff/${staffId}`,
    );
    return response.data;
  },

  create: async (payload: CreateStaffSalonRequest): Promise<Result<number>> => {
    const response = await axiosInstance.post<Result<number>>(
      "/staff-salons",
      payload,
    );
    return response.data;
  },

  update: async (
    id: number,
    payload: UpdateStaffSalonRequest,
  ): Promise<Result<object>> => {
    const response = await axiosInstance.patch<Result<object>>(
      `/staff-salons/${id}`,
      payload,
    );
    return response.data;
  },

  delete: async (id: number): Promise<Result<object>> => {
    const response = await axiosInstance.delete<Result<object>>(
      `/staff-salons/${id}`,
    );
    return response.data;
  },

  // assignManager: (payload: AssignManagerPayload) =>
  //   axiosInstance
  //     .post<Result<object>>(`/staff-salons/assign-manager`, payload)
  //     .then((r) => r.data),

  // removeManager: (payload: AssignManagerPayload) =>
  //   axiosInstance
  //     .post<Result<object>>(`/staff-salons/remove-manager`, payload)
  //     .then((r) => r.data),
};
