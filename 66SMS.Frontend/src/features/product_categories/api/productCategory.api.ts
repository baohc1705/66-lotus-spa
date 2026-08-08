import axiosInstance from "@/shared/api/axiosInstance";
import type {
  Result,
  PagedResult,
  PageRequest,
} from "@/shared/types/common.types";
import type {
  CreateProductCategoryPayload,
  DeleteProductCategoryMultiplesPayload,
  ProductCategoryDto,
  UpdateProductCategoryPayload,
} from "../types/productCategory.types";

export const productCategoryApi = {
  getAll: (params: PageRequest) =>
    axiosInstance
      .get<Result<PagedResult<ProductCategoryDto>>>("/product-category", { params })
      .then((r) => r.data),

  getDetail: (id: number) =>
    axiosInstance
      .get<Result<ProductCategoryDto>>(`/product-category/${id}`)
      .then((r) => r.data),

  create: (payload: CreateProductCategoryPayload) =>
    axiosInstance.post<Result<object>>("/product-category", payload).then((r) => r.data),

  update: (id: number, payload: UpdateProductCategoryPayload) =>
    axiosInstance
      .patch<Result<object>>(`/product-category/${id}`, payload)
      .then((r) => r.data),

  delete: (id: number) =>
    axiosInstance.delete<Result<object>>(`/product-category/${id}`).then((r) => r.data),

  deleteMultiples: (payload: DeleteProductCategoryMultiplesPayload) =>
    axiosInstance
      .delete<Result<object>>(`/product-category/bulk`, { data: payload })
      .then((r) => r.data),

  getAllDeleted: (params: PageRequest) =>
    axiosInstance
      .get<
        Result<PagedResult<ProductCategoryDto>>
      >(`/product-category/deleted`, { params })
      .then((r) => r.data),
};
