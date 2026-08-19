import type {
  CreateServiceRequest,
  GetAllServiceQuery,
  ServiceDto,
  ServiceFullDto,
  UpdateServiceRequest,
} from "@/features/services/types/service.types";
import axiosInstance from "@/shared/api/axiosInstance";
import type { PagedResult, Result } from "@/shared/types/common.types";

export const serviceApi = {
  // Query API
  getAll: async (
    params: GetAllServiceQuery,
  ): Promise<Result<PagedResult<ServiceDto>>> => {
    const response = await axiosInstance.get("/service", { params });
    return response.data;
  },

  adminGetAll: async (
    params: GetAllServiceQuery,
  ): Promise<Result<PagedResult<ServiceDto>>> => {
    const response = await axiosInstance.get("/service/admin", { params });
    return response.data;
  },

  getDetail: async (id: number): Promise<Result<ServiceFullDto>> => {
    const response = await axiosInstance.get(`/service/${id}`);
    return response.data;
  },

  // Command API
  create: async (request: CreateServiceRequest): Promise<Result<object>> => {
    const response = await axiosInstance.post<Result<object>>(
      "/service",
      request,
    );
    return response.data;
  },

  update: async (
    id: number,
    request: UpdateServiceRequest,
  ): Promise<Result<object>> => {
    const response = await axiosInstance.patch<Result<object>>(
      `/service/${id}`,
      request,
    );
    return response.data;
  },

  delete: async (id: number): Promise<Result<object>> => {
    const response = await axiosInstance.delete<Result<object>>(
      `/service/${id}`,
    );
    return response.data;
  },

  deleteBulk: async (ids: number[]): Promise<Result<object>> => {
    const response = await axiosInstance.delete<Result<object>>(
      "/service/bulk",
      { data: { ids } },
    );
    return response.data;
  },

  deleteServiceProduct: async (id: number): Promise<Result<object>> => {
    const response = await axiosInstance.delete<Result<object>>(
      `/service-product/${id}`,
    );
    return response.data;
  },
};
