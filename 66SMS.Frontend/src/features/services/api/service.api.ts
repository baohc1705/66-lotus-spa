import axiosInstance from "@/shared/api/axiosInstance";
import { API } from "@/shared/api/endpoints";
import type {
  Result,
  PagedResult,
  PageRequest,
} from "@/shared/types/common.types";
import type {
  CreateServicePayload,
  ServiceDto,
  UpdateServicePayload,
  GetAllServiceQuery,
  DeleteServiceMultiplesPayload,
} from "../types/service.types";

const BASE = API.services;

function toAdminQuery(params: PageRequest & { categoryId?: number }): GetAllServiceQuery {
  return {
    pageIndex: params.pageIndex,
    pageSize: params.pageSize,
    keyword: params.filter || undefined,
    orderBy: params.orderBy,
    isDescending: params.isDescending,
    categoryId: params.categoryId,
  };
}

export const serviceApi = {
  // Get All
  getAll: (params: PageRequest & { categoryId?: number }) =>
    axiosInstance
      .get<Result<PagedResult<ServiceDto>>>(BASE, {
        params: {
          pageIndex: params.pageIndex,
          pageSize: params.pageSize,
          keyword: params.filter || undefined,
          orderBy: params.orderBy,
          isDescending: params.isDescending,
          categoryId: params.categoryId,
        },
      })
      .then((r) => r.data),

  // Get Detail
  getDetail: (id: number) =>
    axiosInstance.get<Result<ServiceDto>>(`${BASE}/${id}`).then((r) => r.data),

  // Create Service
  create: (payload: CreateServicePayload) =>
    axiosInstance.post<Result<object>>(BASE, payload).then((r) => r.data),

  // Update Service
  update: (id: number, payload: UpdateServicePayload) =>
    axiosInstance
      .patch<Result<object>>(`${BASE}/${id}`, payload)
      .then((r) => r.data),

  // Delete Service
  delete: (id: number) =>
    axiosInstance.delete<Result<object>>(`${BASE}/${id}`).then((r) => r.data),

  // Admin Get All
  adminGetAll: (params: PageRequest & { categoryId?: number }) =>
    axiosInstance
      .get<Result<PagedResult<ServiceDto>>>(`${BASE}/admin`, {
        params: toAdminQuery(params),
      })
      .then((r) => r.data),

  // Delete Multiple Services
  deleteMultiples: (payload: DeleteServiceMultiplesPayload) =>
    axiosInstance
      .delete<Result<object>>(`${BASE}/bulk`, { data: payload })
      .then((r) => r.data),

  // Get All Deleted
  getAllDeleted: (params: PageRequest & { categoryId?: number }) =>
    axiosInstance
      .get<Result<PagedResult<ServiceDto>>>(`${BASE}/deleted`, {
        params: toAdminQuery(params),
      })
      .then((r) => r.data),
};
