import axiosInstance from "@/shared/api/axiosInstance";
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
      .get<Result<PagedResult<ServiceListDto>>>("/service", {
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
      .get<Result<ServiceDetailDto>>(`/service/${id}`)
      .then((r) => r.data),

  create: (payload: CreateServicePayload) =>
    axiosInstance.post<Result<object>>("/service", payload).then((r) => r.data),

  update: (id: number, payload: UpdateServicePayload) =>
    axiosInstance
      .patch<Result<object>>(`/service/${id}`, payload)
      .then((r) => r.data),

  delete: (id: number) =>
    axiosInstance.delete<Result<object>>(`/service/${id}`).then((r) => r.data),

  adminGetAll: (params: PageRequest & { categoryId?: number }) =>
    axiosInstance
      .get<Result<PagedResult<ServiceListDto>>>(`/service/admin`, {
        params: toAdminQuery(params),
      })
      .then((r) => r.data),

  deleteMultiples: (payload: DeleteServiceMultiplesPayload) =>
    axiosInstance
      .delete<Result<object>>(`/service/bulk`, { data: payload })
      .then((r) => r.data),

  getAllDeleted: (params: PageRequest & { categoryId?: number }) =>
    axiosInstance
      .get<Result<PagedResult<ServiceListDto>>>(`/service/deleted`, {
        params: toAdminQuery(params),
      })
      .then((r) => r.data),

  deleteServiceProduct: (id: number) =>
    axiosInstance
      .delete<Result<object>>(`/service-product/${id}`)
      .then((r) => r.data),
};
