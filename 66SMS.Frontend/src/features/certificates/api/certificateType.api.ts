import type { PagedResult, Result } from "@/shared/types/common.types";
import type {
  CertificateTypeDto,
  CreateCertificateTypeRequest,
  GetAllCertificateTypeQuery,
  UpdateCertificateTypeRequest,
} from "@/features/certificates/types/certificateType.types";
import axiosInstance from "@/shared/api/axiosInstance";

export const certificateTypeApi = {
  getAllTypes: async (
    params: GetAllCertificateTypeQuery,
  ): Promise<Result<PagedResult<CertificateTypeDto>>> => {
    const response = await axiosInstance.get("/certificate-type", { params });
    return response.data;
  },

  getDetailType: async (id: number): Promise<Result<CertificateTypeDto>> => {
    const response = await axiosInstance.get(`/certificate-type/${id}`);
    return response.data;
  },

  // Command API
  createType: async (
    request: CreateCertificateTypeRequest,
  ): Promise<Result<number>> => {
    const response = await axiosInstance.post<Result<number>>(
      "/certificate-type",
      request,
    );
    return response.data;
  },

  updateType: async (
    id: number,
    request: UpdateCertificateTypeRequest,
  ): Promise<Result<object>> => {
    const response = await axiosInstance.patch<Result<object>>(
      `/certificate-type/${id}`,
      request,
    );
    return response.data;
  },

  deleteType: async (id: number): Promise<Result<object>> => {
    const response = await axiosInstance.delete<Result<object>>(
      `/certificate-type/${id}`,
    );
    return response.data;
  },
};
