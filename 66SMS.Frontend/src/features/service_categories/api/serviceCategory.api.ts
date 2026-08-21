import type {
  CreateServiceCategoryRequest,
  GetAllServiceCategoryQuery,
  ServiceCategoryDto,
  UpdateServiceCategoryRequest,
} from "@/features/service_categories/types/serviceCategory.types";
import axiosInstance from "@/shared/api/axiosInstance";
import type { PagedResult, Result } from "@/shared/types/common.types";

export const serviceCategoryApi = {
  // Query API
  getAll: async (
    params: GetAllServiceCategoryQuery,
  ): Promise<Result<PagedResult<ServiceCategoryDto>>> => {
    const response = await axiosInstance.get("/service-category", { params });
    return response.data;
  },

  adminGetAll: async (
    params: GetAllServiceCategoryQuery,
  ): Promise<Result<PagedResult<ServiceCategoryDto>>> => {
    const response = await axiosInstance.get("/service-category/admin", {
      params,
    });
    return response.data;
  },

  getDetail: async (id: number): Promise<Result<ServiceCategoryDto>> => {
    const response = await axiosInstance.get(`/service-category/${id}`);
    return response.data;
  },

  // Command API
  create: async (
    request: CreateServiceCategoryRequest,
  ): Promise<Result<object>> => {
    const response = await axiosInstance.post<Result<object>>(
      "/service-category",
      request,
    );
    return response.data;
  },

  update: async (
    id: number,
    request: UpdateServiceCategoryRequest,
  ): Promise<Result<object>> => {
    const response = await axiosInstance.patch<Result<object>>(
      `/service-category/${id}`,
      request,
    );
    return response.data;
  },

  delete: async (id: number): Promise<Result<object>> => {
    const response = await axiosInstance.delete<Result<object>>(
      `/service-category/${id}`,
    );
    return response.data;
  },

  deleteBulk: async (ids: number[]): Promise<Result<object>> => {
    const response = await axiosInstance.delete<Result<object>>(
      "/service-category/bulk",
      {
        data: { ids },
      },
    );
    return response.data;
  },
};
