import axiosInstance from "@/shared/api/axiosInstance";
import { API } from "@/shared/api/endpoints";
import type {
  Result,
  PagedResult,
  PageRequest,
} from "@/shared/types/common.types";
import type {
  ProductDto,
  CreateProductPayload,
  UpdateProductPayload,
  GetAllProductQuery,
  DeleteProductMultiplesPayload,
  ProductImageDto,
  CreateProductImagePayload,
  UpdateProductImagePayload,
} from "../types/product.types";

const BASE_PRODUCT = API.products;
const BASE_IMAGE = API.productImages;

function toAdminQuery(params: PageRequest): GetAllProductQuery {
  return {
    pageIndex: params.pageIndex,
    pageSize: params.pageSize,
    keyword: params.filter || undefined,
    orderBy: params.orderBy,
    isDescending: params.isDescending,
  };
}

export const productApi = {
  getAll: (params: PageRequest) =>
    axiosInstance
      .get<Result<PagedResult<ProductDto>>>(BASE_PRODUCT, {
        params: {
          pageIndex: params.pageIndex,
          pageSize: params.pageSize,
          keyword: params.filter || undefined,
          orderBy: params.orderBy,
          isDescending: params.isDescending,
        },
      })
      .then((r) => r.data),

  adminGetAll: (params: PageRequest) =>
    axiosInstance
      .get<Result<PagedResult<ProductDto>>>(`${BASE_PRODUCT}/admin`, {
        params: toAdminQuery(params),
      })
      .then((r) => r.data),

  getAllDeleted: (params: PageRequest) =>
    axiosInstance
      .get<Result<PagedResult<ProductDto>>>(`${BASE_PRODUCT}/deleted`, {
        params: toAdminQuery(params),
      })
      .then((r) => r.data),

  getDetail: (id: number) =>
    axiosInstance
      .get<Result<ProductDto>>(`${BASE_PRODUCT}/${id}`)
      .then((r) => r.data),

  create: (payload: CreateProductPayload) =>
    axiosInstance
      .post<Result<object>>(BASE_PRODUCT, payload)
      .then((r) => r.data),

  update: (id: number, payload: UpdateProductPayload) =>
    axiosInstance
      .patch<Result<object>>(`${BASE_PRODUCT}/${id}`, payload)
      .then((r) => r.data),

  delete: (id: number) =>
    axiosInstance
      .delete<Result<object>>(`${BASE_PRODUCT}/${id}`)
      .then((r) => r.data),

  deleteMultiples: (payload: DeleteProductMultiplesPayload) =>
    axiosInstance
      .delete<Result<object>>(`${BASE_PRODUCT}/bulk`, { data: payload })
      .then((r) => r.data),
};

export const productImageApi = {
  getAll: (params?: PageRequest & { productId?: number }) =>
    axiosInstance
      .get<Result<PagedResult<ProductImageDto>>>(BASE_IMAGE, { params })
      .then((r) => r.data),

  getDetail: (id: number) =>
    axiosInstance
      .get<Result<ProductImageDto>>(`${BASE_IMAGE}/${id}`)
      .then((r) => r.data),

  create: (payload: CreateProductImagePayload) =>
    axiosInstance
      .post<Result<number>>(BASE_IMAGE, payload)
      .then((r) => r.data),

  update: (id: number, payload: UpdateProductImagePayload) =>
    axiosInstance
      .patch<Result<object>>(`${BASE_IMAGE}/${id}`, payload)
      .then((r) => r.data),

  delete: (id: number) =>
    axiosInstance
      .delete<Result<object>>(`${BASE_IMAGE}/${id}`)
      .then((r) => r.data),
};
