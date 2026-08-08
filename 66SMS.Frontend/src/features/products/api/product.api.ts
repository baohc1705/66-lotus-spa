import axiosInstance from "@/shared/api/axiosInstance";
import type {
  Result,
  PagedResult,
  PageRequest,
} from "@/shared/types/common.types";
import type {
  ProductDto,
  ProductFullDto,
  CreateProductPayload,
  UpdateProductPayload,
  GetAllProductQuery,
  DeleteProductMultiplesPayload,
} from "../types/product.types";


function toAdminQuery(
  params: PageRequest & { categoryId?: number },
): GetAllProductQuery {
  return {
    pageIndex: params.pageIndex,
    pageSize: params.pageSize,
    keyword: params.filter || undefined,
    orderBy: params.orderBy,
    isDescending: params.isDescending,
    categoryId: params.categoryId,
  };
}

export const productApi = {
  getAll: (params: PageRequest & { categoryId?: number }) =>
    axiosInstance
      .get<Result<PagedResult<ProductDto>>>("/product", {
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

  adminGetAll: (params: PageRequest & { categoryId?: number }) =>
    axiosInstance
      .get<Result<PagedResult<ProductDto>>>(`/product/admin`, {
        params: toAdminQuery(params),
      })
      .then((r) => r.data),

  getAllDeleted: (params: PageRequest & { categoryId?: number }) =>
    axiosInstance
      .get<Result<PagedResult<ProductDto>>>(`/product/deleted`, {
        params: toAdminQuery(params),
      })
      .then((r) => r.data),

  getDetail: (id: number) =>
    axiosInstance
      .get<Result<ProductFullDto>>(`/product/${id}`)
      .then((r) => r.data),

  create: (payload: CreateProductPayload) =>
    axiosInstance
      .post<Result<object>>("/product", payload)
      .then((r) => r.data),

  update: (id: number, payload: UpdateProductPayload) =>
    axiosInstance
      .patch<Result<object>>(`/product/${id}`, payload)
      .then((r) => r.data),

  delete: (id: number) =>
    axiosInstance
      .delete<Result<object>>(`/product/${id}`)
      .then((r) => r.data),

  deleteMultiples: (payload: DeleteProductMultiplesPayload) =>
    axiosInstance
      .delete<Result<object>>(`/product/bulk`, { data: payload })
      .then((r) => r.data),
};
