import axiosInstance from "@/shared/api/axiosInstance";
import { API } from "@/shared/api/endpoints";
import type {
  Result,
  PagedResult,
  PageRequest,
} from "@/shared/types/common.types";
import type {
  CreateServicePayload,
  ServiceListDto,
  ServiceDetailDto,
  UpdateServicePayload,
  GetAllServiceQuery,
  DeleteServiceMultiplesPayload,
} from "../types/service.types";

const BASE = API.services;

function toAdminQuery(
  params: PageRequest & { categoryId?: number },
): GetAllServiceQuery {
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
  getAll: (params: PageRequest & { categoryId?: number }) =>
    axiosInstance
      .get<Result<PagedResult<ServiceListDto>>>(BASE, {
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

  getDetail: (id: number) =>
    axiosInstance
      .get<Result<ServiceDetailDto>>(`${BASE}/${id}`)
      .then((r) => r.data),

  create: (payload: CreateServicePayload) =>
    axiosInstance.post<Result<object>>(BASE, payload).then((r) => r.data),

  update: (id: number, payload: UpdateServicePayload) =>
    axiosInstance
      .patch<Result<object>>(`${BASE}/${id}`, payload)
      .then((r) => r.data),

  delete: (id: number) =>
    axiosInstance.delete<Result<object>>(`${BASE}/${id}`).then((r) => r.data),

  adminGetAll: (params: PageRequest & { categoryId?: number }) =>
    axiosInstance
      .get<Result<PagedResult<ServiceListDto>>>(`${BASE}/admin`, {
        params: toAdminQuery(params),
      })
      .then((r) => r.data),

  deleteMultiples: (payload: DeleteServiceMultiplesPayload) =>
    axiosInstance
      .delete<Result<object>>(`${BASE}/bulk`, { data: payload })
      .then((r) => r.data),

  getAllDeleted: (params: PageRequest & { categoryId?: number }) =>
    axiosInstance
      .get<Result<PagedResult<ServiceListDto>>>(`${BASE}/deleted`, {
        params: toAdminQuery(params),
      })
      .then((r) => r.data),

  deleteServiceProduct: (id: number) =>
    axiosInstance
      .delete<Result<object>>(`${API.serviceProducts}/${id}`)
      .then((r) => r.data),
};
