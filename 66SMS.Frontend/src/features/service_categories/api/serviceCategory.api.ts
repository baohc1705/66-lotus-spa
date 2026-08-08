import axiosInstance from "@/shared/api/axiosInstance";
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
      .get<Result<PagedResult<ServiceCategoryDto>>>("/service-category", {
        params: toQuery(params),
      })
      .then((r) => r.data),

  adminGetAll: (params: PageRequest) =>
    axiosInstance
      .get<Result<PagedResult<ServiceCategoryDto>>>(`/service-category/admin`, {
        params: toQuery(params),
      })
      .then((r) => r.data),

  getDetail: (id: number) =>
    axiosInstance
      .get<Result<ServiceCategoryDto>>(`/service-category/${id}`)
      .then((r) => r.data),

  create: (payload: CreateServiceCategoryPayload) =>
    axiosInstance.post<Result<object>>("/service-category", payload).then((r) => r.data),

  update: (id: number, payload: UpdateServiceCategoryPayload) =>
    axiosInstance
      .patch<Result<object>>(`/service-category/${id}`, payload)
      .then((r) => r.data),

  delete: (id: number) =>
    axiosInstance.delete<Result<object>>(`/service-category/${id}`).then((r) => r.data),

  deleteMultiples: (payload: DeleteServiceCategoryMultiplesPayload) =>
    axiosInstance
      .delete<Result<object>>(`/service-category/bulk`, { data: payload })
      .then((r) => r.data),

  getAllDeleted: (params: PageRequest) =>
    axiosInstance
      .get<Result<PagedResult<ServiceCategoryDto>>>(`/service-category/deleted`, {
        params: toQuery(params),
      })
      .then((r) => r.data),
};
