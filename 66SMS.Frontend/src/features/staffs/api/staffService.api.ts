import type {
  CreateStaffServiceRequest,
  GetStaffServicesQuery,
  StaffServiceDto,
  UpdateStaffServiceRequest,
} from "@/features/staffs/types/staffService.types";
import axiosInstance from "@/shared/api/axiosInstance";
import type { PagedResult, Result } from "@/shared/types/common.types";

export const staffServiceApi = {
  // Query API
  getAll: async (
    params: GetStaffServicesQuery,
  ): Promise<Result<PagedResult<StaffServiceDto>>> => {
    const response = await axiosInstance.get("/staffs/services", { params });
    return response.data;
  },

  // Command API
  create: async (
    request: CreateStaffServiceRequest,
  ): Promise<Result<object>> => {
    const response = await axiosInstance.post("/staffs/services", request);
    return response.data;
  },

  update: async (
    id: number,
    request: UpdateStaffServiceRequest,
  ): Promise<Result<object>> => {
    const response = await axiosInstance.patch(
      `/staffs/services/${id}`,
      request,
    );
    return response.data;
  },

  delete: async (ids: number[]): Promise<Result<object>> => {
    const response = await axiosInstance.delete("/staffs/services", {
      data: { ids },
    });
    return response.data;
  },
};
