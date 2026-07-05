import axiosInstance from "@/shared/api/axiosInstance";
import { API } from "@/shared/api/endpoints";
import type {
  Result,
  PagedResult,
  PageRequest,
} from "@/shared/types/common.types";
import type {
  CreateServiceCategoryPayload,
  DeleteServiceCategoryMultiplesPayload,
  ServiceCategoryDTO,
  UpdateServiceCategoryPayload,
} from "../types/service_category.types";

const BASE = API.serviceCategories;

export const serviceCategoryApi = {
  // Get All
  getAll: (params: PageRequest) =>
    axiosInstance
      .get<Result<PagedResult<ServiceCategoryDTO>>>(BASE, { params })
      .then((r) => r.data),

  // Admin Get All
  adminGetAll: (params: PageRequest) =>
    axiosInstance
      .get<Result<PagedResult<ServiceCategoryDTO>>>(`${BASE}/admin`, { params })
      .then((r) => r.data),

  // Get Detail
  getDetail: (id: number) =>
    axiosInstance
      .get<Result<ServiceCategoryDTO>>(`${BASE}/${id}`)
      .then((r) => r.data),

  // Create Category
  create: (payload: CreateServiceCategoryPayload) =>
    axiosInstance.post<Result<object>>(BASE, payload).then((r) => r.data),

  // Update category
  update: (id: number, payload: UpdateServiceCategoryPayload) =>
    axiosInstance
      .patch<Result<object>>(`${BASE}/${id}`, payload)
      .then((r) => r.data),

  // Delete category
  delete: (id: number) =>
    axiosInstance.delete<Result<object>>(`${BASE}/${id}`).then((r) => r.data),

  // Delete multiple categories
  deleteMultiples: (payload: DeleteServiceCategoryMultiplesPayload) =>
    axiosInstance
      .delete<Result<object>>(`${BASE}/bulk`, { data: payload })
      .then((r) => r.data),

  // Get All Deleted
  getAllDeleted: (params: PageRequest) =>
    axiosInstance
      .get<Result<PagedResult<ServiceCategoryDTO>>>(`${BASE}/deleted`, { params })
      .then((r) => r.data),
};
