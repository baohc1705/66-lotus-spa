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
  ServiceCategoryDto,
  UpdateServiceCategoryPayload,
} from "../types/serviceCategory.types";

const BASE = API.serviceCategories;

function toQuery(params: PageRequest) {
  return {
    pageIndex: params.pageIndex,
    pageSize: params.pageSize,
    keyword: params.filter || undefined,
    orderBy: params.orderBy,
    isDescending: params.isDescending,
  };
}

export const serviceCategoryApi = {
  getAll: (params: PageRequest) =>
    axiosInstance
      .get<Result<PagedResult<ServiceCategoryDto>>>(BASE, {
        params: toQuery(params),
      })
      .then((r) => r.data),

  adminGetAll: (params: PageRequest) =>
    axiosInstance
      .get<Result<PagedResult<ServiceCategoryDto>>>(`${BASE}/admin`, {
        params: toQuery(params),
      })
      .then((r) => r.data),

  getDetail: (id: number) =>
    axiosInstance
      .get<Result<ServiceCategoryDto>>(`${BASE}/${id}`)
      .then((r) => r.data),

  create: (payload: CreateServiceCategoryPayload) =>
    axiosInstance.post<Result<object>>(BASE, payload).then((r) => r.data),

  update: (id: number, payload: UpdateServiceCategoryPayload) =>
    axiosInstance
      .patch<Result<object>>(`${BASE}/${id}`, payload)
      .then((r) => r.data),

  delete: (id: number) =>
    axiosInstance.delete<Result<object>>(`${BASE}/${id}`).then((r) => r.data),

  deleteMultiples: (payload: DeleteServiceCategoryMultiplesPayload) =>
    axiosInstance
      .delete<Result<object>>(`${BASE}/bulk`, { data: payload })
      .then((r) => r.data),

  getAllDeleted: (params: PageRequest) =>
    axiosInstance
      .get<Result<PagedResult<ServiceCategoryDto>>>(`${BASE}/deleted`, {
        params: toQuery(params),
      })
      .then((r) => r.data),
};
