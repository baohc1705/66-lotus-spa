import type {
  StaffCertificateDto,
  GetAllStaffCertificateQuery,
  CreateStaffCertificateRequest,
  UpdateStaffCertificateRequest,
} from "@/features/certificates/types/certificate.types";
import axiosInstance from "@/shared/api/axiosInstance";
import type { PagedResult, Result } from "@/shared/types/common.types";

export const certificateApi = {
  // Query API
  getAll: async (
    params: GetAllStaffCertificateQuery,
  ): Promise<Result<PagedResult<StaffCertificateDto>>> => {
    const response = await axiosInstance.get("/staff-certificate", { params });
    return response.data;
  },

  getDetail: async (id: number): Promise<Result<StaffCertificateDto>> => {
    const response = await axiosInstance.get(`/staff-certificate/${id}`);
    return response.data;
  },

  // Command API

  create: async (
    request: CreateStaffCertificateRequest,
  ): Promise<Result<number>> => {
    const response = await axiosInstance.post<Result<number>>(
      "/staff-certificate",
      request,
    );
    return response.data;
  },

  createMine: async (
    request: Omit<CreateStaffCertificateRequest, "staffId" | "status">,
  ): Promise<Result<number>> => {
    const response = await axiosInstance.post<Result<number>>(
      "/staff-certificate/mine",
      request,
    );
    return response.data;
  },

  update: async (
    id: number,
    request: UpdateStaffCertificateRequest,
  ): Promise<Result<object>> => {
    const response = await axiosInstance.patch<Result<object>>(
      `/staff-certificate/${id}`,
      request,
    );
    return response.data;
  },

  delete: async (id: number): Promise<Result<object>> => {
    const response = await axiosInstance.delete<Result<object>>(
      `/staff-certificate/${id}`,
    );
    return response.data;
  },
};
