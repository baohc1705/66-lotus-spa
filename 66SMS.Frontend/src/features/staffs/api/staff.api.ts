import type {
  CreateStaffRequest,
  GetAllStaffQuery,
  StaffDto,
  StaffFullDto,
  UpdateStaffRequest,
} from "@/features/staffs/types/staff.types";
import axiosInstance from "@/shared/api/axiosInstance";
import type { PagedResult, Result } from "@/shared/types/common.types";

export const staffApi = {
  // Query API
  getAll: async (
    params: GetAllStaffQuery,
  ): Promise<Result<PagedResult<StaffDto>>> => {
    const response = await axiosInstance.get("/staffs", { params });
    return response.data;
  },

  adminGetAll: async (
    params: GetAllStaffQuery,
  ): Promise<Result<PagedResult<StaffDto>>> => {
    const response = await axiosInstance.get("/staffs/admin", { params });
    return response.data;
  },

  getDetail: async (id: number): Promise<Result<StaffFullDto>> => {
    const response = await axiosInstance.get(`/staffs/${id}`);
    return response.data;
  },

  // Command API
  create: async (request: CreateStaffRequest): Promise<Result<object>> => {
    const response = await axiosInstance.post("/staffs", request);
    return response.data;
  },

  update: async (
    id: number,
    request: UpdateStaffRequest,
  ): Promise<Result<object>> => {
    const response = await axiosInstance.patch(`/staffs/${id}`, request);
    return response.data;
  },

  delete: async (id: number): Promise<Result<object>> => {
    const response = await axiosInstance.delete(`/staffs/${id}`);
    return response.data;
  },

  deleteBulk: async (ids: number[]): Promise<Result<object>> => {
    const response = await axiosInstance.delete("/staffs/bulk", {
      data: { ids },
    });
    return response.data;
  },
};
